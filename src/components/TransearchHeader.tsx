"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Check, Users, Shield } from "lucide-react";
import { TRANSEARCH_ASSIGNMENTS } from "@/lib/agents";

interface TransearchHeaderProps {
  currentRoute?: string;
  badgeText?: string;
}

export default function TransearchHeader({
  currentRoute,
  badgeText = "Global Executive Search & Leadership Advisory",
}: TransearchHeaderProps) {
  const pathname = usePathname();
  const activeRoute = currentRoute || pathname;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentAssignment = TRANSEARCH_ASSIGNMENTS.find(
    (a) => a.route === activeRoute
  );

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

      {/* Right: Route Switcher Dropdown */}
      <div className="flex items-center gap-2.5" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-[#1B365D] hover:bg-[#254677] text-white border border-[#D4AF37]/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Switch between different agent routes"
          >
            <Users size={14} className="text-[#D4AF37]" />
            <span className="hidden md:inline text-gray-200">
              {currentAssignment ? currentAssignment.candidateName || currentAssignment.title : "Switch Agent Route"}
            </span>
            <span className="md:hidden text-gray-200">Routes</span>
            <ChevronDown size={14} className={`text-[#D4AF37] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0D1B2A] border border-[#D4AF37]/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#D4AF37]/20 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                Executive Voice Agent Routes
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {TRANSEARCH_ASSIGNMENTS.map((item) => {
                  const isCurrent = activeRoute === item.route;
                  return (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? "bg-[#1B365D] text-[#D4AF37] font-bold border border-[#D4AF37]/30"
                          : "text-gray-300 hover:bg-[#1B365D]/60 hover:text-white"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">
                          {item.candidateName ? `${item.candidateName} · ${item.client}` : item.title}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {item.route}
                        </div>
                      </div>
                      {isCurrent && <Check size={14} className="text-[#D4AF37] shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
