import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { z } from 'zod';

export const runtime = 'nodejs';

const payloadSchema = z
    .object({
        name: z.string().trim(),
        email: z.string().trim(),
        phone: z.string().trim().optional().default(''),
    })
    .superRefine((value, context) => {
        if (!value.name) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter your name.',
                path: ['name'],
            });
        }

        if (!value.email) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter your email.',
                path: ['email'],
            });
            return;
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.email);
        if (!isEmail) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter a valid email address.',
                path: ['email'],
            });
        }

        if (value.phone && !/^\+?[1-9]\d{7,14}$/.test(value.phone)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter a valid phone number (e.g. +14155552671).',
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
    name,
    email,
    phone,
    source,
}: {
    name: string;
    email: string;
    phone: string;
    source: string;
}) => {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A1:E1';

    if (!sheetId) {
        throw new Error('GOOGLE_SHEET_ID is missing.');
    }

    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            majorDimension: 'ROWS',
            values: [[new Date().toISOString(), name, email, phone, source]],
        },
    });
};

const sendThankYou = async (email: string) => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !user || !pass || !from) {
        throw new Error('SMTP credentials are missing.');
    }

    const siteUrl =
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    const logoUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/logo-main.png` : '';

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });

    await transporter.sendMail({
        from,
        to: email,
        subject: 'Genfux — You are in',
        html: `
            <div style="margin:0;padding:24px;background:#020202;font-family:Inter,Arial,sans-serif;color:#f5f5f5;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;border-radius:24px;overflow:hidden;background:#090909;border:1px solid #242424;">
                    <tr>
                        <td style="padding:0;background:linear-gradient(160deg,#0f0f0f 0%,#151515 40%,#0b0b0b 100%);">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding:28px 28px 18px 28px;text-align:center;border-bottom:1px solid #1f1f1f;">
                                        ${
                                            logoUrl
                                                ? `<img src="${logoUrl}" alt="Genfux" width="138" style="display:block;margin:0 auto 12px auto;height:auto;border:0;outline:none;text-decoration:none;" />`
                                                : '<div style="margin:0 auto 12px auto;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.02em;">Genfux</div>'
                                        }
                                        <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#a3a3a3;">Genfux Waitlist</div>
                                        <h1 style="margin:12px 0 0 0;font-size:38px;line-height:1;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">You are in.</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:24px 28px 28px 28px;">
                                        <p style="margin:0 0 14px 0;color:#d4d4d8;font-size:16px;line-height:1.7;">
                                            Thanks for joining the Genfux waitlist.
                                        </p>
                                        <p style="margin:0 0 24px 0;color:#d4d4d8;font-size:16px;line-height:1.7;">
                                            We will reach out soon with early access details.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
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

        const name = parsed.data.name;
        const email = parsed.data.email;
        const phone = parsed.data.phone;

        await appendToSheet({
            name,
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
