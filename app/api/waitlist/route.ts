import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { z } from 'zod';

const payloadSchema = z
  .object({
    email: z.string().trim().optional().default(''),
    phone: z.string().trim().optional().default(''),
  })
  .superRefine((value, context) => {
    const hasEmail = Boolean(value.email);
    const hasPhone = Boolean(value.phone);

    if (!hasEmail && !hasPhone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter at least email or phone number.',
        path: ['email'],
      });
      return;
    }

    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.email)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid email address.',
        path: ['email'],
      });
    }

    if (hasPhone && !/^\+?[1-9]\d{7,14}$/.test(value.phone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number format.',
        path: ['phone'],
      });
    }
  });

const getSheetsClient = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google credentials are missing.');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

const appendToSheet = async ({
  email,
  phone,
  source,
}: {
  email: string;
  phone: string;
  source: string;
}) => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:D';

  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID is missing.');
  }

  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[new Date().toISOString(), email, phone, source]],
    },
  });
};

const sendThankYou = async (email: string) => {
  if (!email) return;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error('SMTP credentials are missing.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: 'You are on the Genfux waitlist',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;padding:20px;background:#050505;color:#f5f5f5;border:1px solid #232323;border-radius:16px;">
        <h1 style="font-size:24px;margin:0 0 12px;">You are in.</h1>
        <p style="line-height:1.6;margin:0;">Thanks for joining the Genfux waitlist. We will reach out soon with early access.</p>
      </div>
    `,
  });
};

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || 'Invalid payload.' },
        { status: 400 }
      );
    }

    const email = parsed.data.email;
    const phone = parsed.data.phone;

    await appendToSheet({
      email,
      phone,
      source: 'vercel-nextjs',
    });

    await sendThankYou(email);

    return NextResponse.json({ message: 'Submitted successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Submission failed unexpectedly.',
      },
      { status: 500 }
    );
  }
}
