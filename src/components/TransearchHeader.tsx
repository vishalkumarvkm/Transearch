"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

interface TransearchHeaderProps {
  currentRoute?: string;
  badgeText?: string;
}

export default function TransearchHeader({
  badgeText = "Global Executive Search & Leadership Advisory",
}: TransearchHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E0E0E0] bg-[#0D1B2A] text-white relative z-30">
      {/* Left: Back Link & Firm Branding */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1B365D] hover:bg-[#D4AF37] hover:text-[#0D1B2A] text-white shadow-sm flex items-center justify-center border border-[#D4AF37]/30 transition-all hover:scale-105 shrink-0"
          title="Back to All Executive Mandates"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#D4AF37]">
              TRANSEARCH International
            </span>
          </div>
          <span className="text-[10px] text-gray-300 font-semibold tracking-normal line-clamp-1">
            {badgeText}
          </span>
        </div>
      </div>

      {/* Right: Portal Links */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 bg-[#1B365D] hover:bg-[#D4AF37] hover:text-[#0D1B2A] text-gray-200 border border-[#D4AF37]/40 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
          title="Access Executive Call Audit & Analytics Portal"
        >
          <Shield size={13} className="text-[#D4AF37]" />
          <span className="hidden sm:inline">Audit</span>
        </Link>

        <div className="w-8 h-8 rounded-full bg-[#1B365D] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs flex items-center justify-center shrink-0">
          TS
        </div>
      </div>
    </header>
  );
}
