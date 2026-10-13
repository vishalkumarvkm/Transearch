"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall } from "lucide-react";
import TransearchHeader from "@/components/TransearchHeader";
import TransearchOxaneCandidateVoicePanel from "@/components/TransearchOxaneCandidateVoicePanel";
import { transearchSchlowAgent } from "@/lib/agents/transearchSchlow";

export default function TalkToSaraSchlowPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("start") === "true") {
        setIsOpen(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F4F5F7] flex flex-col justify-end md:justify-center items-center overflow-hidden relative select-none p-0 md:p-4">
      {/* Landing Page Content */}
      <div className="absolute inset-0 z-0 flex flex-col bg-white">
        {/* Header with Route Switcher */}
        <TransearchHeader currentRoute="/talktosara-schlow" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-xl mx-auto -mt-8">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center">
            <img src="/conv_image001.png" alt="TRANSEARCH Executive Search & Leadership Consulting" className="h-16 md:h-20 w-auto object-contain" />
          </div>

          <div className="text-center max-w-lg w-full mb-8 space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0D1B2A]">Hi Steven.</h1>
            <p className="text-base md:text-lg text-gray-700 font-medium">
              I hope you&apos;re doing well.
            </p>
            <p className="text-base md:text-lg text-gray-700 font-medium leading-relaxed px-2">
              I would like to share a senior leadership assignment with you on behalf of TRANSEARCH for our client, Oxane Partners.
            </p>
            <p className="text-xs font-bold text-[#D4AF37] tracking-[0.2em] uppercase pt-4">
              REGARDS, SARA · ROUTE: /TALKTOSARA-SCHLOW
            </p>
          </div>

          {!isOpen && (
            <button
              onClick={async () => {
                try {
                  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioCtxClass({ latencyHint: 'playback' });
                  await ctx.resume();
                  (window as any).__primedAudioContext = ctx;
                } catch (e) {
                  console.warn('Failed to prime AudioContext from gesture:', e);
                }
                setIsOpen(true);
              }}
              className="bg-[#0D1B2A] hover:bg-[#1B365D] text-[#D4AF37] border border-[#D4AF37]/40 font-sans font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
            >
              <PhoneCall size={16} className="text-[#D4AF37]" />
              <span>START CALL</span>
            </button>
          )}
        </main>
      </div>

      {/* Voice Assistant Modal */}
      <TransearchOxaneCandidateVoicePanel 
        agent={transearchSchlowAgent}
        candidateName="Steven"
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}
