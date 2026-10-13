"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, Type as SchemaType } from "@google/genai";
import { transearchSophieAgent } from '@/lib/agents/transearchSophie';

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

function parseSpokenPhoneNumber(phone: string): string {
  if (!phone) return "";

  const words = phone.toLowerCase()
    .replace(/[-\(\)\+]/g, ' ')
    .split(/\s+/);

  const wordToDigit: { [key: string]: string } = {
    'zero': '0', 'one': '1', 'two': '2', 'to': '2', 'too': '2',
    'three': '3', 'four': '4', 'for': '4', 'five': '5', 'six': '6',
    'seven': '7', 'eight': '8', 'ate': '8', 'nine': '9', 'oh': '0', 'o': '0'
  };

  let result = "";
  let doubleNext = false;
  let tripleNext = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim();
    if (!word) continue;

    if (word === 'double' || word === 'duble') {
      doubleNext = true;
      continue;
    }
    if (word === 'triple' || word === 'tripple') {
      tripleNext = true;
      continue;
    }

    let digitStr = "";
    if (wordToDigit[word] !== undefined) {
      digitStr = wordToDigit[word];
    } else {
      digitStr = word.replace(/\D/g, '');
    }

    if (digitStr) {
      if (digitStr.length === 1) {
        if (doubleNext) {
          result += digitStr + digitStr;
          doubleNext = false;
        } else if (tripleNext) {
          result += digitStr + digitStr + digitStr;
          tripleNext = false;
        } else {
          result += digitStr;
        }
      } else {
        if (doubleNext) {
          result += digitStr[0] + digitStr;
          doubleNext = false;
        } else if (tripleNext) {
          result += digitStr[0] + digitStr[0] + digitStr;
          tripleNext = false;
        } else {
          result += digitStr;
        }
      }
    }
  }

  return result;
}

interface TransearchSophieVoicePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GEMINI_LIVE_MODEL = "gemini-3.1-flash-live-preview";
const OUTPUT_SAMPLE_RATE = 24000;
const INPUT_SAMPLE_RATE = 16000;

function resampleAudio(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.round(input.length / ratio);
  const output = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1);
    const frac = srcIndex - srcIndexFloor;
    output[i] = input[srcIndexFloor] * (1 - frac) + input[srcIndexCeil] * frac;
  }
  return output;
}

function resampleInt16(input: Float32Array, fromRate: number, toRate: number): Int16Array {
  const resampled = resampleAudio(input, fromRate, toRate);
  const pcm16 = new Int16Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    pcm16[i] = Math.max(-1, Math.min(1, resampled[i])) * 0x7fff;
  }
  return pcm16;
}

export default function TransearchSophieVoicePanel({ isOpen, onClose }: TransearchSophieVoicePanelProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const wakeLockRef = useRef<any>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const scheduledEndRef = useRef(0);
  const activeConnectionIdRef = useRef(0);
  const connectingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const segmentsRef = useRef<Array<{ speaker: 'User' | 'Agent'; text: string; timestamp: number }>>([]);
  const leadInfoRef = useRef<{ name?: string; email?: string; phone?: string; currentRole?: string; notes?: string } | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const processedToolCallsRef = useRef<Set<string>>(new Set());
  const actualPlaybackRateRef = useRef<number>(OUTPUT_SAMPLE_RATE);
  const actualMicRateRef = useRef<number>(INPUT_SAMPLE_RATE);
  const [audioVolume, setAudioVolume] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const videoWakeLockRef = useRef<HTMLVideoElement | null>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        if (!wakeLockRef.current || wakeLockRef.current.released) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          console.log('[TransearchSophieVoicePanel] Screen WakeLock active - screen will remain awake');
          
          wakeLockRef.current.addEventListener('release', () => {
            console.log('[TransearchSophieVoicePanel] Screen WakeLock released by system');
            if (isOpen) {
              setTimeout(() => {
                requestWakeLock();
              }, 1000);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[TransearchSophieVoicePanel] Screen WakeLock API failed, using mobile video keep-alive fallback:', e);
    }

    try {
      if (!videoWakeLockRef.current && typeof document !== 'undefined') {
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.muted = true;
        video.loop = true;
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0';
        video.style.pointerEvents = 'none';
        video.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAptZGF0AAAAAA==';
        document.body.appendChild(video);
        videoWakeLockRef.current = video;
      }
      if (videoWakeLockRef.current) {
        videoWakeLockRef.current.play().catch(() => {});
      }
    } catch (_) {}
  }, [isOpen]);

  const releaseWakeLock = useCallback(() => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    } catch {}
    try {
      if (videoWakeLockRef.current) {
        videoWakeLockRef.current.pause();
        if (videoWakeLockRef.current.parentNode) {
          videoWakeLockRef.current.parentNode.removeChild(videoWakeLockRef.current);
        }
        videoWakeLockRef.current = null;
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => releaseWakeLock();
  }, [isOpen, requestWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        if (playbackCtxRef.current && playbackCtxRef.current.state === 'suspended') {
          try { await playbackCtxRef.current.resume(); } catch {}
        }
        if (micCtxRef.current && micCtxRef.current.state === 'suspended') {
          try { await micCtxRef.current.resume(); } catch {}
        }
        if (isOpen) {
          await requestWakeLock();
        }
      }
    };
    const handleFocus = async () => {
      if (isOpen) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isOpen, requestWakeLock]);

  const transcriptSavedRef = useRef(false);

  const logSegment = useCallback((speaker: 'User' | 'Agent', text: string) => {
    if (!sessionIdRef.current || !text) return;
    const segments = segmentsRef.current;
    const last = segments[segments.length - 1];
    if (last && last.speaker === speaker) {
      last.text += text;
    } else {
      segments.push({ speaker, text, timestamp: Date.now() });
    }
    setTranscript(text);
  }, []);

  const saveTranscriptToBackend = useCallback(() => {
    const sessionId = sessionIdRef.current;
    const segments = segmentsRef.current;
    const startTime = sessionStartTimeRef.current;
    if (!sessionId || segments.length === 0 || transcriptSavedRef.current) return;

    transcriptSavedRef.current = true;
    const endTime = Date.now();
    const durationSecs = startTime ? (endTime - startTime) / 1000 : 0;

    const payload = {
      session_id: sessionId,
      agent_id: transearchSophieAgent.id,
      agent_name: transearchSophieAgent.agentName,
      industry: transearchSophieAgent.role,
      language: transearchSophieAgent.languages,
      segments: segments.map(s => ({
        speaker: s.speaker,
        text: s.text,
        timestamp: s.timestamp
      })),
      started_at: startTime,
      ended_at: endTime,
      duration_secs: durationSecs,
      lead_info: leadInfoRef.current || undefined,
      source_url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    fetch('/api/web-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async r => {
      if (r.status === 201 || r.status === 200) {
        console.log('[TransearchSophieVoicePanel] Transcript synced successfully:', sessionId);
      } else {
        console.warn('[TransearchSophieVoicePanel] Sync failed status:', r.status);
      }
    }).catch(err => {
      console.warn('[TransearchSophieVoicePanel] Sync failed error:', err?.message);
    });
  }, []);

  const ensurePlaybackCtx = async (): Promise<AudioContext> => {
    const primed = (window as any).__primedAudioContext;
    const isPrimedValid = primed && primed.state !== 'closed';

    if (!playbackCtxRef.current || playbackCtxRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      playbackCtxRef.current = isPrimedValid ? primed : new AudioCtx({ latencyHint: 'playback' });
      actualPlaybackRateRef.current = playbackCtxRef.current!.sampleRate;
    }
    if (playbackCtxRef.current!.state === 'suspended') {
      await playbackCtxRef.current!.resume();
    }
    return playbackCtxRef.current!;
  };

  const scheduleAudioChunk = useCallback(async (base64Data: string) => {
    if (isMuted) return;
    try {
      const ctx = await ensurePlaybackCtx();
      const binary = atob(base64Data);
      const bytes = Uint8Array.from({ length: binary.length }, (_, i) => binary.charCodeAt(i));
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = Float32Array.from(pcm16, s => s / 32768.0);

      let sum = 0;
      for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
      const rms = Math.sqrt(sum / float32.length);
      setAudioVolume(Math.min(1.0, rms * 5.0));

      const actualRate = ctx.sampleRate;
      let audioData: Float32Array = new Float32Array(float32);
      let bufferRate = OUTPUT_SAMPLE_RATE;
      if (actualRate !== OUTPUT_SAMPLE_RATE) {
        audioData = resampleAudio(float32, OUTPUT_SAMPLE_RATE, actualRate);
        bufferRate = actualRate;
      }

      const buffer = ctx.createBuffer(1, audioData.length, bufferRate);
      buffer.getChannelData(0).set(audioData);
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.5;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      const now = ctx.currentTime;
      const startTime = Math.max(now, scheduledEndRef.current);
      source.start(startTime);
      scheduledEndRef.current = startTime + buffer.duration;
      setTimeout(() => setAudioVolume(0), (audioData.length / bufferRate) * 1000);
    } catch (e) {
      console.error("Error scheduling audio chunk:", e);
    }
  }, [isMuted]);

  const clearAudio = useCallback(() => {
    scheduledEndRef.current = 0;
    if (playbackCtxRef.current) {
      try {
        playbackCtxRef.current.close().catch(() => { });
      } catch (_) { }
      playbackCtxRef.current = null;
    }
    if (typeof window !== 'undefined' && (window as any).__primedAudioContext) {
      try {
        (window as any).__primedAudioContext.close().catch(() => { });
      } catch (_) { }
      (window as any).__primedAudioContext = null;
    }
    setAudioVolume(0);
  }, []);

  const teardown = useCallback(() => {
    activeConnectionIdRef.current++;
    processedToolCallsRef.current.clear();

    saveTranscriptToBackend();
    clearAudio();

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (micProcessorRef.current) {
      try { micProcessorRef.current.disconnect(); } catch (_) { }
      micProcessorRef.current = null;
    }
    if (micCtxRef.current) {
      try { micCtxRef.current.close(); } catch (_) { }
      micCtxRef.current = null;
    }
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (_) { }
      sessionRef.current = null;
    }

    leadInfoRef.current = null;
    sessionStartTimeRef.current = null;
    connectingRef.current = false;
    setState('idle');
    setAudioVolume(0);
    releaseWakeLock();
  }, [clearAudio, saveTranscriptToBackend]);

  const startMic = async () => {
    try {
      let stream = micStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
          video: false
        });
        micStreamRef.current = stream;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const micCtx = new AudioCtx({ sampleRate: INPUT_SAMPLE_RATE });
      micCtxRef.current = micCtx;
      actualMicRateRef.current = micCtx.sampleRate;
      if (micCtx.state === 'suspended') await micCtx.resume();

      const source = micCtx.createMediaStreamSource(stream);
      const processor = micCtx.createScriptProcessor(4096, 1, 1);
      micProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(micCtx.destination);

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current || state === 'connecting') return;
        const inputData = e.inputBuffer.getChannelData(0);
        const actualRate = actualMicRateRef.current;
        let pcm16: Int16Array;
        let sum = 0;

        if (actualRate !== INPUT_SAMPLE_RATE) {
          pcm16 = resampleInt16(inputData, actualRate, INPUT_SAMPLE_RATE);
          for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        } else {
          pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
            sum += inputData[i] * inputData[i];
          }
        }

        const rms = Math.sqrt(sum / inputData.length);
        if (state === 'listening') setAudioVolume(Math.min(1.0, rms * 5.0));

        const u8 = new Uint8Array(pcm16.buffer);
        const CHUNK_SIZE = 8192;
        let binary = '';
        for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
          const slice = u8.subarray(i, Math.min(i + CHUNK_SIZE, u8.length));
          binary += String.fromCharCode.apply(null, Array.from(slice));
        }
        const base64 = btoa(binary);

        try {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64, mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}` },
          });
        } catch (err) { }
      };
    } catch (err: any) {
      console.error('Mic access denied:', err);
      setState('error');
      setConnectionError('Microphone access denied. Please allow microphone permissions.');
      teardown();
    }
  };

  const startConnection = useCallback(async () => {
    const connectionId = ++activeConnectionIdRef.current;
    if (connectingRef.current) return;
    connectingRef.current = true;

    setState('connecting');
    setConnectionError(null);
    setTranscript('');

    try {
      await ensurePlaybackCtx();
    } catch (e) {
      console.warn('Failed to prime playback context early:', e);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
        video: false
      });
      micStreamRef.current = stream;
    } catch (err: any) {
      console.error('Microphone permission denied before connection:', err);
      setState('error');
      setConnectionError('Microphone access denied. Please allow microphone permissions.');
      connectingRef.current = false;
      return;
    }

    let sessionToken: string;
    try {
      const res = await fetch('/api/voice/token');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      sessionToken = data.token;
    } catch (err: any) {
      console.error('Failed to get voice token:', err);
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (envKey) {
        sessionToken = envKey;
      } else {
        setConnectionError('Secure session token initialization failed.');
        setState('error');
        connectingRef.current = false;
        return;
      }
    }

    try {
      if (connectionId !== activeConnectionIdRef.current) return;

      const ai = new GoogleGenAI({
        apiKey: sessionToken,
        httpOptions: { apiVersion: 'v1alpha' } as any
      });

      const sessionPromise = ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: transearchSophieAgent.voiceName } },
          },
          systemInstruction: {
            parts: [{ text: transearchSophieAgent.systemInstruction }]
          },
          tools: [{
            functionDeclarations: [
              {
                name: "capture_lead_and_send_email",
                description: "Captures lead information (name, email, phone) and sends an executive candidate enquiry email.",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING, description: "The full name of the user." },
                    email: { type: SchemaType.STRING, description: "The email address of the user." },
                    phone: { type: SchemaType.STRING, description: "The phone number of the user." },
                    industry: { type: SchemaType.STRING, description: "The candidate's current role or organization." },
                    notes: { type: SchemaType.STRING, description: "Additional details about experience, relocation willingness, and general alignment." }
                  },
                  required: ["name", "email", "phone"]
                }
              }
            ]
          }],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            if (connectionId !== activeConnectionIdRef.current) {
              teardown();
              return;
            }
            setState('listening');
            connectingRef.current = false;
            transcriptSavedRef.current = false;

            const sessionId = `transearch-sophie-${Date.now()}`;
            sessionIdRef.current = sessionId;
            segmentsRef.current = [];
            leadInfoRef.current = null;
            sessionStartTimeRef.current = Date.now();

            sessionPromise.then(session => {
              if (connectionId !== activeConnectionIdRef.current) return;
              sessionRef.current = session;

              const greetingText = `User joined. Introduce yourself naturally as Sara from TRANSEARCH International for Sophie Laurent. Vibe to follow: "${transearchSophieAgent.greeting}". Keep it calm, measured, and highly professional.`;
              try {
                session.sendRealtimeInput({ text: greetingText });
              } catch (e) {
                console.error("Greeting trigger failed", e);
              }
              startMic();
            });
          },

          onmessage: async (msg: any) => {
            if (connectionId !== activeConnectionIdRef.current) return;

            const functionCalls = msg.toolCall?.functionCalls ||
              msg.serverContent?.modelTurn?.parts?.filter((p: any) => p.functionCall).map((p: any) => p.functionCall) ||
              [];

            for (const call of functionCalls) {
              const callId = call.id || call.name;
              if (processedToolCallsRef.current.has(callId)) continue;

              if (call.name === "capture_lead_and_send_email") {
                processedToolCallsRef.current.add(callId);
                const { name, email, phone, industry, notes } = call.args;

                const cleanedEmail = (email || '').replace(/^mailto:/i, '').trim();
                const cleanedPhone = parseSpokenPhoneNumber(phone);

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isEmailValid = emailRegex.test(cleanedEmail);

                let isPhoneValid = false;
                let finalPhone = cleanedPhone;
                if (cleanedPhone.length === 10) {
                  isPhoneValid = true;
                } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91')) {
                  finalPhone = cleanedPhone.substring(2);
                  isPhoneValid = true;
                } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('0')) {
                  finalPhone = cleanedPhone.substring(1);
                  isPhoneValid = true;
                }

                if (!isEmailValid || !isPhoneValid) {
                  const errorMsg = !isEmailValid
                    ? "Invalid email format. Please repeat it back and confirm the correct email address."
                    : "Invalid phone number. It must be a valid 10-digit number. Please ask the user to provide a valid 10-digit mobile number.";

                  console.warn(`[TransearchSophieVoicePanel] Validation failed:`, { email, phone });
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: "capture_lead_and_send_email",
                      response: { success: false, error: errorMsg }
                    }]
                  });
                  continue;
                }

                leadInfoRef.current = { name, email: cleanedEmail, phone: finalPhone, currentRole: industry, notes };

                try {
                  const names = name.split(" ");
                  const firstName = names[0];
                  const lastName = names.length > 1 ? names.slice(1).join(" ") : "Executive Lead";

                  fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      firstName,
                      lastName,
                      email: cleanedEmail,
                      phone: finalPhone,
                      companyName: "TRANSEARCH Candidate (Sophie)",
                      industry: "Executive Search",
                      jobTitle: industry || "Executive Candidate",
                      monthlyVolume: "Not Specified",
                      teamSize: "Not Specified",
                      useCases: [`Executive Alignment: ${notes || 'Not Specified'}`],
                      deploymentModel: "Cloud",
                      languages: "English",
                      timeline: "Immediate",
                      additionalInfo: notes || "Captured via TRANSEARCH Sara AI Voice Consultant interaction for Sophie Laurent.",
                      sourceAgent: transearchSophieAgent.id
                    })
                  }).then(async r => {
                    const data = await r.json();
                    console.log("[TransearchSophieVoicePanel] CRM post result:", data);
                  }).catch(err => {
                    console.error("[TransearchSophieVoicePanel] CRM post fail:", err);
                  });

                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: "capture_lead_and_send_email",
                      response: { success: true, message: "Details submitted successfully." }
                    }]
                  });
                } catch (err) {
                  console.error("Tool execution error:", err);
                  sessionRef.current?.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: "capture_lead_and_send_email",
                      response: { success: false, error: "System registration failed. Please ask user to try again later." }
                    }]
                  });
                }
              }
            }

            const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              setState('speaking');
              scheduleAudioChunk(audio);
            }

            if (msg.serverContent?.interrupted) {
              clearAudio();
              setState('listening');
            }

            const userText = msg.serverContent?.inputTranscription?.text || msg.inputAudioTranscription?.parts?.[0]?.text || msg.inputTranscription?.text;
            if (userText) {
              logSegment('User', userText);
            }

            const textPart = msg.serverContent?.outputTranscription?.text || msg.outputTranscription?.text;
            if (textPart) {
              logSegment('Agent', textPart);
            }

            if (msg.serverContent?.turnComplete) {
              setState('listening');
              setAudioVolume(0);
            }
          },

          onerror: (err: any) => {
            if (connectionId !== activeConnectionIdRef.current) return;
            console.error('[TransearchSophieVoicePanel] Live error:', err);
            setState('error');
            setConnectionError(err?.message || 'Secure voice session connection error.');
            teardown();
          },

          onclose: (ev?: any) => {
            if (connectionId !== activeConnectionIdRef.current) return;
            console.log('[TransearchSophieVoicePanel] Session closed', ev);
            teardown();
          }
        }
      });

      await sessionPromise;

    } catch (err: any) {
      console.error('[TransearchSophieVoicePanel] Error connecting:', err);
      connectingRef.current = false;
      setState('error');
      setConnectionError(err?.message || 'Failed to establish live channel.');
      teardown();
    }
  }, [scheduleAudioChunk, clearAudio, teardown, logSegment]);

  useEffect(() => {
    if (isOpen) {
      startConnection();
    } else {
      teardown();
      setTranscript('');
    }
    return () => teardown();
  }, [isOpen, startConnection, teardown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.08;

      let numWaves = 3;
      let amplitude = 0;
      let frequency = 0.02;
      let speedFactor = 1;

      if (state === 'listening') {
        amplitude = 6 + audioVolume * 36;
        frequency = 0.02;
        numWaves = 4;
        speedFactor = 1.1;
      } else if (state === 'speaking') {
        amplitude = 8 + audioVolume * 45;
        frequency = 0.025;
        numWaves = 5;
        speedFactor = 1.4;
      } else if (state === 'connecting') {
        amplitude = 3;
        frequency = 0.01;
        numWaves = 2;
        speedFactor = 0.6;
      } else {
        amplitude = 0.5;
        frequency = 0.005;
        numWaves = 1;
        speedFactor = 0.15;
      }

      ctx.lineWidth = 1.25;

      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath();
        const yOffset = (i - (numWaves - 1) / 2) * 1.5;
        const wavePhase = phase * speedFactor + i * (Math.PI / 8);
        const opacity = 0.8 - (i / numWaves) * 0.5;

        ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;

        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI);
          const y = height / 2 + yOffset + Math.sin(x * frequency + wavePhase) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [state, audioVolume]);

  const handleRetry = () => {
    teardown();
    ensurePlaybackCtx().catch(() => { });
    startConnection();
  };

  const handleTryClose = () => {
    teardown();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-md p-0 md:p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={handleTryClose} />

      <AnimatePresence>
        <motion.div
          initial={{ y: "100%", opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full md:max-w-[480px] bg-[#0D1B2A] border-t md:border border-[#D4AF37]/30 rounded-t-[32px] md:rounded-[28px] shadow-[0_-8px_30px_rgba(0,0,0,0.4),0_15px_30px_rgba(0,0,0,0.5)] overflow-hidden h-[55vh] h-[55dvh] md:h-auto flex flex-col z-10 p-6 pb-8 md:pb-6 select-none"
        >
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                state === 'listening' ? 'bg-[#D4AF37]' :
                  state === 'speaking' ? 'bg-[#D4AF37]' :
                    state === 'connecting' ? 'bg-[#FBBC05] animate-pulse' :
                      state === 'error' ? 'bg-[#EA4335]' : 'bg-neutral-400'
                }`} />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                {state === 'connecting' ? 'CONNECTING...' :
                  state === 'listening' ? 'LISTENING...' :
                    state === 'speaking' ? 'SPEAKING...' :
                      state === 'error' ? 'ERROR' : 'READY'}
              </span>
            </div>

            <button
              onClick={handleTryClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[#1B365D] text-[#E0E1DD] hover:bg-[#D4AF37] hover:text-[#0D1B2A] transition-all cursor-pointer border border-[#D4AF37]/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-6 relative">
            <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center mb-4 md:mb-8">
              <AnimatePresence>
                {(state === 'listening' || state === 'speaking') && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-[#D4AF37]/20 bg-[#1B365D]/30"
                    />
                    <motion.div
                      animate={{ scale: 1.02 + audioVolume * 0.15 }}
                      transition={{ duration: 0.1 }}
                      className="absolute w-26 h-26 md:w-32 md:h-32 rounded-full border border-[#D4AF37]/35 bg-[#1B365D]/50 shadow-sm"
                    />
                  </>
                )}
              </AnimatePresence>

              <motion.div
                animate={(state === 'listening' || state === 'speaking') ? {
                  scale: 1 + audioVolume * 0.08
                } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                onClick={state === 'error' ? handleRetry : handleTryClose}
                className="absolute w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#D4AF37] shadow-lg flex items-center justify-center z-10 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                <Mic className="w-7 h-7 md:w-8 md:h-8 text-[#0D1B2A]" />
              </motion.div>
            </div>

            <div className="w-full h-12 md:h-16 mt-2 md:mt-4 relative">
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            <div className="w-full max-w-[360px] text-center min-h-[40px] md:min-h-[48px] px-4 mt-4 md:mt-8 flex items-center justify-center">
              {state === 'error' ? (
                <p className="text-xs font-semibold text-g-red">
                  {connectionError || 'An error occurred during secure connection setup.'}
                </p>
              ) : state === 'connecting' ? (
                <p className="text-sm font-medium text-[#E0E1DD]/70 leading-relaxed italic animate-pulse">
                  Connecting to TRANSEARCH Voice Stack...
                </p>
              ) : (
                <p className="text-sm font-medium text-[#E0E1DD]/80 leading-relaxed italic">
                  Sara is listening...
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
