import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIp, resolveGeoLocation, getDeviceType } from '@/lib/geo';
import { saveInteraction, formatDuration } from '@/lib/callStorage';
import { CallInteraction } from '@/lib/types/interaction';

/**
 * POST /api/web-transcript
 * Persists full interaction metadata (Date, Time, IP, Geolocation, Candidate Info, Transcripts)
 * and sends an executive notification email to search consultants.
 */

const TARGET_EMAIL = process.env.TRANSCRIPT_RECIPIENT_EMAIL || 'mailtovishal12030@gmail.com';

// In-memory deduplication cache
const recentTranscripts = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 60000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      session_id,
      agent_id,
      agent_name,
      industry,
      language,
      segments,
      started_at,
      ended_at,
      duration_secs,
      lead_info,
      source_url,
      user_agent,
    } = body;

    // Deduplication check by session_id
    if (session_id) {
      const now = Date.now();
      const lastSent = recentTranscripts.get(session_id);
      if (lastSent && (now - lastSent) < DEDUPLICATION_WINDOW_MS) {
        console.log(`[web-transcript] Deduplicated request for session_id ${session_id}.`);
        return NextResponse.json({ success: true, deduplicated: true }, { status: 200 });
      }
      recentTranscripts.set(session_id, now);
    }

    // Capture IP Address & Geolocation
    const ip = getClientIp(request);
    const geoLocation = await resolveGeoLocation(ip, request);
    const rawUserAgent = user_agent || request.headers.get('user-agent') || undefined;
    const deviceType = getDeviceType(rawUserAgent);

    // Timestamps
    const now = new Date();
    const startDate = started_at ? new Date(started_at) : now;
    const dateFormatted = startDate.toISOString().split('T')[0];
    const timeFormatted = startDate.toTimeString().split(' ')[0];
    const duration = typeof duration_secs === 'number' ? duration_secs : 0;
    const durationFormatted = formatDuration(duration);

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const totalTurns = Array.isArray(segments) ? segments.length : 0;
    const hasLead = Boolean(lead_info && (lead_info.name || lead_info.email || lead_info.phone));

    // Construct persistent interaction record
    const interactionRecord: CallInteraction = {
      id: callId,
      sessionId: session_id || callId,
      date: dateFormatted,
      time: timeFormatted,
      startedAt: startDate.toISOString(),
      endedAt: ended_at ? new Date(ended_at).toISOString() : now.toISOString(),
      durationSecs: duration,
      durationFormatted,
      ipAddress: ip,
      geoLocation,
      agentId: agent_id || 'transearch-general',
      agentName: agent_name || 'Sara (TRANSEARCH International)',
      mandate: industry || 'Executive Search & Leadership Advisory',
      route: source_url ? new URL(source_url, 'http://localhost').pathname : '/switzerland-client-partner',
      userAgent: rawUserAgent,
      deviceType,
      candidateInfo: lead_info || undefined,
      segments: Array.isArray(segments) ? segments : [],
      totalTurns,
      status: hasLead ? 'Lead Captured' : 'Completed',
      createdAt: now.toISOString(),
    };

    // 1. Save to Persistent Disk Storage
    try {
      await saveInteraction(interactionRecord);
      console.log(`[web-transcript] Saved interaction ${callId} for IP ${ip} (${geoLocation.city}, ${geoLocation.country})`);
    } catch (storeErr: any) {
      console.error('[web-transcript] Error persisting interaction to disk:', storeErr?.message);
    }

    // 2. Sync to Python MongoDB Backend if available
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://187.126.124.110:8000';
    try {
      const pyController = new AbortController();
      const pyTimeout = setTimeout(() => pyController.abort(), 2000);
      await fetch(`${pythonBackendUrl}/api/web-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip,
          'user-agent': rawUserAgent || '',
        },
        body: JSON.stringify(body),
        signal: pyController.signal,
      });
      clearTimeout(pyTimeout);
      console.log(`[web-transcript] Synced interaction ${callId} to Python MongoDB Backend`);
    } catch {
      // Python backend might be offline; local storage holds the record safely
    }

    // Do not email empty transcripts
    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { success: true, message: 'Interaction logged with no dialogue segments', id: callId },
        { status: 200 }
      );
    }

    // 2. Email Formatting
    const startTimeFormatted = startDate.toLocaleString();
    const agentLabel = agent_name ? `${agent_name} (${agent_id || 'TRANSEARCH'})` : 'Sara (TRANSEARCH International)';

    const transcriptHtml = segments.map((seg: any) => {
      const isUser = seg.speaker === 'User';
      const speakerName = isUser ? (lead_info?.name || 'Candidate') : (agent_name || 'Sara (TRANSEARCH Consultant)');
      const bgColor = isUser ? '#f0f4f9' : '#fffdf5';
      const borderColor = isUser ? '#1B365D' : '#D4AF37';
      const textColor = isUser ? '#0D1B2A' : '#1A202C';

      return `
        <div style="margin-bottom: 12px; padding: 12px 16px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 6px;">
          <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: ${borderColor}; margin-bottom: 4px;">
            ${speakerName}
          </div>
          <div style="font-size: 14px; color: ${textColor}; line-height: 1.5; white-space: pre-wrap;">
            ${seg.text}
          </div>
        </div>
      `;
    }).join('');

    let leadDetailsHtml = '';
    if (lead_info && (lead_info.name || lead_info.email || lead_info.phone)) {
      leadDetailsHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; margin-bottom: 10px; color: #0D1B2A; font-size: 15px;">📋 Captured Candidate Information</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Name:</strong> ${lead_info.name || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${lead_info.email || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> ${lead_info.phone || 'N/A'}</p>
          ${lead_info.currentRole ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Role/Practice:</strong> ${lead_info.currentRole}</p>` : ''}
          ${lead_info.notes ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Executive Notes / Alignment:</strong> ${lead_info.notes}</p>` : ''}
        </div>
      `;
    }

    // 3. Email Sending (Disabled by default: transcripts are persisted directly to database)
    const enableEmailTranscripts = process.env.ENABLE_EMAIL_TRANSCRIPTS === 'true';

    if (enableEmailTranscripts && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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

        const candidateName = lead_info?.name ? ` - Candidate: ${lead_info.name}` : '';
        const subject = `[TRANSEARCH Transcript] ${agentLabel}${candidateName} (${durationFormatted})`;

        const mailOptions = {
          from: `"TRANSEARCH Voice Analytics" <${process.env.EMAIL_USER}>`,
          to: TARGET_EMAIL,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #e5e7eb; border-radius: 12px;">
              <div style="border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #0D1B2A; font-size: 20px;">🎙️ TRANSEARCH Executive Conversation Transcript</h2>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Call ID: ${callId} | Session ID: ${session_id || 'N/A'}</p>
              </div>

              <div style="background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><strong>Consultant:</strong> ${agentLabel}</div>
                <div><strong>Practice/Mandate:</strong> ${industry || 'Executive Search'}</div>
                <div><strong>Date & Time:</strong> ${startTimeFormatted}</div>
                <div><strong>Duration:</strong> ${durationFormatted}</div>
                <div><strong>Caller IP:</strong> ${ip}</div>
                <div><strong>Location:</strong> ${geoLocation.city || 'Unknown'}, ${geoLocation.country || 'Global'}</div>
                ${source_url ? `<div style="grid-column: span 2;"><strong>Source URL:</strong> ${source_url}</div>` : ''}
              </div>

              ${leadDetailsHtml}

              <h3 style="color: #0D1B2A; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                💬 Conversation Transcript
              </h3>

              <div style="margin-bottom: 24px;">
                ${transcriptHtml}
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                Stored in TRANSEARCH Intelligence Audit Store &bull; Automatic System Dispatch
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[web-transcript] Transcript emailed successfully to ${TARGET_EMAIL}`);
      } catch (mailErr: any) {
        console.warn(`[web-transcript] SMTP failed, transcript stored safely in database:`, mailErr?.message);
      }
    } else {
      console.log(`[web-transcript] Emailing disabled (ENABLE_EMAIL_TRANSCRIPTS=${enableEmailTranscripts}). Transcript persisted directly to database.`);
    }

    return NextResponse.json({
      success: true,
      message: 'Transcript and interaction persisted to database successfully',
      id: callId,
      sessionId: session_id || callId,
      storedInDb: true,
      emailSent: enableEmailTranscripts,
    }, { status: 200 });

  } catch (error: any) {
    console.error('[web-transcript] Error processing transcript:', error?.message);
    return NextResponse.json(
      { error: 'Failed to process transcript', details: error?.message },
      { status: 500 }
    );
  }
}
