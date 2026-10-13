"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import TransearchVoicePanel from "@/components/TransearchVoicePanel";

export default function HomePage() {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const names = contactForm.name.trim().split(" ");
      const firstName = names[0] || "Executive";
      const lastName = names.length > 1 ? names.slice(1).join(" ") : "Inquiry";

      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: contactForm.email,
          phone: contactForm.phone,
          companyName: contactForm.organization,
          additionalInfo: contactForm.message,
          sourceAgent: "Homepage Contact Modal"
        })
      });
      setContactSubmitted(true);
    } catch {
      setContactSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e26] text-white flex flex-col font-sans selection:bg-[#cca352] selection:text-[#0b0e26]">
      {/* -------------------------------------------------------------
          1. Header Navigation
      ------------------------------------------------------------- */}
      <header className="w-full bg-[#0b0e26] border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link href="/" className="inline-block">
            <span className="font-serif font-bold tracking-widest text-white text-base sm:text-lg md:text-xl uppercase select-none">
              TRANSEARCHAI.COM<span className="text-[#cca352]">.</span>
            </span>
          </Link>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-[#cca352] transition-colors hidden sm:flex items-center gap-1.5 font-medium"
              title="Access Call Audit Intelligence Portal"
            >
              <ShieldCheck size={14} className="text-[#cca352]" />
              <span>Portal</span>
            </Link>

            <button
              onClick={() => setIsContactOpen(true)}
              className="bg-[#cca352] hover:bg-[#d8b363] active:bg-[#be9747] text-[#0b0e26] font-bold text-xs tracking-wider uppercase px-5 sm:px-7 py-2.5 rounded-none transition-all cursor-pointer shadow-sm"
            >
              CONTACT US
            </button>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. Hero Section
      ------------------------------------------------------------- */}
      <section className="bg-[#0b0e26] pt-20 sm:pt-28 pb-24 sm:pb-32 px-6 sm:px-12 text-center flex-1 flex flex-col justify-center items-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Eyebrow Sub-heading */}
          <p className="text-[#cca352] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-6 sm:mb-8 select-none">
            GLOBAL RETAINED EXECUTIVE SEARCH
          </p>

          {/* Main Hero Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-normal leading-[1.18] tracking-tight mb-8">
            Your World Partner in Executive<br />
            Search
          </h1>

          {/* Descriptive Subtitle */}
          <p className="text-[#8e9eb5] text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-14">
            Transearch connects organisations with exceptional leadership talent across the
            globe — locally relevant, globally competitive.
          </p>

          {/* Interactive Voice AI Banner / Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="inline-flex items-center justify-center bg-[#cca352] hover:bg-[#d8b363] active:bg-[#be9747] text-[#0b0e26] font-bold text-xs sm:text-[13px] tracking-wider uppercase px-7 sm:px-10 py-3.5 sm:py-4 rounded-none shadow-md transition-all active:scale-[0.99] cursor-pointer"
              title="Click to begin confidential AI Voice Briefing with Sara"
            >
              THIS IS A AI PRODUCT OF TRANSEARCH INDIA INTERNATIONAL.
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. Section 2: WHO WE ARE
      ------------------------------------------------------------- */}
      <section className="bg-white text-[#0b0e26] py-20 sm:py-28 px-6 sm:px-12 md:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Centered Eyebrow */}
          <p className="text-[#cca352] text-xs font-semibold tracking-[0.25em] uppercase text-center mb-4 select-none">
            WHO WE ARE
          </p>

          {/* Section Headline */}
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#0b0e26] font-normal leading-[1.25] text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            Three decades of executive search, now<br className="hidden sm:inline" />{" "}
            accelerated by AI
          </h2>

          {/* 2-Column Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Descriptive Story */}
            <div className="space-y-6 text-[#475569] text-sm sm:text-base leading-relaxed">
              <p>
                Transearch is a global retained executive search organisation, trusted by
                organisations worldwide to identify and secure senior leadership talent.
              </p>
              <p>
                Our strength lies in combining deep local market knowledge with a globally
                connected network — giving clients access to leadership talent wherever
                they operate, backed by consultants who understand the nuances of each
                market.
              </p>
            </div>

            {/* Right Column: 2x2 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200/80 p-8 sm:p-10 text-center rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#cca352]/50 transition-colors">
                <h3 className="font-serif font-bold text-2xl text-[#0b0e26] mb-2">
                  Global
                </h3>
                <p className="text-xs text-[#64748b] font-medium tracking-wide">
                  Retained Search Network
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200/80 p-8 sm:p-10 text-center rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#cca352]/50 transition-colors">
                <h3 className="font-serif font-bold text-2xl text-[#0b0e26] mb-2">
                  Local
                </h3>
                <p className="text-xs text-[#64748b] font-medium tracking-wide">
                  Market Expertise
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200/80 p-8 sm:p-10 text-center rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#cca352]/50 transition-colors">
                <h3 className="font-serif font-bold text-2xl text-[#0b0e26] mb-2">
                  Senior
                </h3>
                <p className="text-xs text-[#64748b] font-medium tracking-wide">
                  Leadership Focus
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200/80 p-8 sm:p-10 text-center rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#cca352]/50 transition-colors">
                <h3 className="font-serif font-bold text-2xl text-[#0b0e26] mb-2">
                  Trusted
                </h3>
                <p className="text-xs text-[#64748b] font-medium tracking-wide">
                  Client Partnerships
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. Footer
      ------------------------------------------------------------- */}
      <footer className="w-full bg-[#0b0e26] text-[#64748b] text-xs py-10 px-6 sm:px-12 md:px-16 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 Transearch. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="mailto:contact@transearchindia.com"
              className="text-[#64748b] hover:text-white transition-colors"
            >
              contact@transearchindia.com
            </a>

            <Link
              href="/admin"
              className="text-slate-600 hover:text-[#cca352] transition-colors"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          5. Voice Agent Panel (Sara)
      ------------------------------------------------------------- */}
      <TransearchVoicePanel
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      {/* -------------------------------------------------------------
          6. Contact Us Modal
      ------------------------------------------------------------- */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b0e26] text-white border border-[#cca352]/40 rounded-none w-full max-w-lg p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => {
                setIsContactOpen(false);
                setContactSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[#cca352] text-xs font-semibold tracking-widest uppercase block mb-1">
                TRANSEARCH INTERNATIONAL
              </span>
              <h3 className="font-serif text-2xl font-normal text-white">
                Contact Leadership Advisory
              </h3>
              <p className="text-xs text-[#8e9eb5] mt-1">
                Reach out directly to our executive team or write to{" "}
                <a
                  href="mailto:contact@transearchindia.com"
                  className="text-[#cca352] hover:underline"
                >
                  contact@transearchindia.com
                </a>
              </p>
            </div>

            {contactSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={44} className="text-[#cca352] mx-auto" />
                <h4 className="text-lg font-bold">Message Received</h4>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Thank you for reaching out. A Senior Consultant from TRANSEARCH International will connect with you shortly.
                </p>
                <button
                  onClick={() => {
                    setIsContactOpen(false);
                    setContactSubmitted(false);
                  }}
                  className="mt-4 bg-[#cca352] text-[#0b0e26] font-bold text-xs uppercase px-6 py-2.5 rounded-none"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g., Alexander Wright"
                    className="w-full bg-[#111736] border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 rounded-none focus:outline-none focus:border-[#cca352]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="alexander@company.com"
                      className="w-full bg-[#111736] border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 rounded-none focus:outline-none focus:border-[#cca352]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#111736] border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 rounded-none focus:outline-none focus:border-[#cca352]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Organization / Mandate Title
                  </label>
                  <input
                    type="text"
                    value={contactForm.organization}
                    onChange={(e) => setContactForm({ ...contactForm, organization: e.target.value })}
                    placeholder="e.g., Board Director / VP Analytics"
                    className="w-full bg-[#111736] border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 rounded-none focus:outline-none focus:border-[#cca352]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Executive Inquiry Details
                  </label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Share brief background regarding your executive search requirements or inquiry..."
                    className="w-full bg-[#111736] border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 rounded-none focus:outline-none focus:border-[#cca352]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(false)}
                    className="text-xs text-slate-400 hover:text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 bg-[#cca352] hover:bg-[#d8b363] text-[#0b0e26] font-bold text-xs uppercase px-6 py-2.5 rounded-none transition"
                  >
                    <Send size={13} />
                    <span>{isSubmitting ? "Sending..." : "Submit Inquiry"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
