"use client";

import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import TransearchHeader from "@/components/TransearchHeader";
import TransearchVoicePanel from "@/components/TransearchVoicePanel";

export default function TalkToTransearchPage() {
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
        <TransearchHeader currentRoute="/talktotransearch" />

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-xl mx-auto -mt-12">
          {/* Orxestra Logo */}
          <div className="mb-8 flex items-center justify-center">
            <img src="/image001.gif" alt="Orxestra" className="h-16 w-auto object-contain" />
          </div>
          
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-[#D4AF37] uppercase mb-3 bg-[#0D1B2A] px-3 py-1 rounded-full border border-[#D4AF37]/20">
            CONFIDENTIAL OUTREACH · SWITZERLAND
          </span>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0D1B2A] tracking-tight mb-4">
            Talk to Sara
          </h1>
          
          <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed max-w-sm">
            Senior leadership assignment outreach on behalf of TRANSEARCH International for a Client Partner vacancy in Switzerland.
          </p>
          
          <button
            onClick={async () => {
              try {
                const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioCtxClass({ latencyHint: 'playback' });
                await ctx.resume();
                (window as any).__primedAudioContext = ctx;
              } catch (e) {
                console.warn('[TalkToTransearch] Failed to prime AudioContext:', e);
              }
              setIsOpen(true);
            }}
            className="bg-[#0D1B2A] hover:bg-[#1B365D] text-white border border-[#D4AF37] font-sans font-bold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer touch-manipulation"
          >
            <Play size={14} fill="#D4AF37" className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] tracking-wider uppercase text-xs">Initiate Call</span>
          </button>
        </main>
      </div>

      {/* Voice Assistant Modal */}
      <TransearchVoicePanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}
