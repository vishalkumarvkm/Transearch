import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const recentLeads = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 30000;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    let {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      industry,
      jobTitle,
      useCases,
      additionalInfo,
      sourceAgent,
    } = data;

    email = (email || '').replace(/^mailto:/i, '').toLowerCase().trim();
    phone = (phone || '').trim();

    const leadKey = `${email}:${phone}`;
    const now = Date.now();
    const lastSubmission = recentLeads.get(leadKey);

    if (lastSubmission && (now - lastSubmission) < DEDUPLICATION_WINDOW_MS) {
      console.log(`[Contact API] Deduplicated request for ${leadKey}. Skipping.`);
      return NextResponse.json({ success: true, deduplicated: true });
    }
    
    recentLeads.set(leadKey, now);

    const enableEmail = process.env.ENABLE_EMAIL_TRANSCRIPTS === 'true';
    if (enableEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptionsInternal = {
          from: `"TRANSEARCH Executive System" <${process.env.EMAIL_USER}>`,
          to: process.env.TRANSCRIPT_RECIPIENT_EMAIL || process.env.EMAIL_USER,
          subject: `New Executive Candidate Registration: ${firstName} ${lastName} (${companyName || 'TRANSEARCH'})`,
          html: `
            <h2>New Candidate Lead Captured via Sara AI</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Current Title/Practice:</strong> ${jobTitle || 'N/A'}</p>
            <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
            <p><strong>Assignment Notes:</strong> ${additionalInfo || 'N/A'}</p>
            <p><strong>Source Agent:</strong> ${sourceAgent || 'Sara'}</p>
          `,
        };

        await transporter.sendMail(mailOptionsInternal);
      } catch (err: any) {
        console.warn(`[Contact API] Mail sending failed:`, err?.message);
      }
    } else {
      console.log(`[Contact API] Captured candidate lead for ${firstName} ${lastName} (${email}, ${phone})`);
    }

    return NextResponse.json({ success: true, message: 'Candidate details submitted successfully.' });
  } catch (error: any) {
    console.error('[Contact API] Error processing contact:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
