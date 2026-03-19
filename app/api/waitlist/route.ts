import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { z } from 'zod';

export const runtime = 'nodejs';

const payloadSchema = z
    .object({
        contact: z.string().trim(),
    })
    .superRefine((value, context) => {
        if (!value.contact) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Enter an email or phone number.',
                path: ['contact'],
            });
            return;
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.contact);
        const isPhone = /^\+?[1-9]\d{7,14}$/.test(value.contact);
        if (!isEmail && !isPhone) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    'Enter a valid email or phone number (e.g. you@example.com or +14155552671).',
                path: ['contact'],
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

    const siteUrl =
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
    const logoUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}/logo-main.jpeg` : '';

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
                                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="border-radius:999px;background:linear-gradient(140deg,#2c2c2c 0%,#141414 100%);border:1px solid #3a3a3a;padding:11px 22px;">
                                                    <a href="https://www.instagram.com/genfux.in/" style="color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;display:inline-block;">Follow Genfux</a>
                                                </td>
                                            </tr>
                                        </table>
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

        const contact = parsed.data.contact;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
        const email = isEmail ? contact : '';
        const phone = isEmail ? '' : contact;

        await appendToSheet({
            email,
            phone,
            source: 'vercel-nextjs',
        });

        await sendThankYou(email);

        return NextResponse.json(
            { message: 'Submitted successfully.', sentEmail: Boolean(email) },
            { status: 200 }
        );
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
