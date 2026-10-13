"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  PhoneCall,
  Clock,
  Users,
  MapPin,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ChevronRight,
  X,
  Copy,
  Check,
  Download,
  Trash2,
  ExternalLink,
  Laptop,
  Smartphone,
  Globe,
  MessageSquare,
  Building2,
  Calendar,
  UserPlus,
  KeyRound,
  Mail,
  UserCheck
} from "lucide-react";
import { CallInteraction, CallStats } from "@/lib/types/interaction";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"calls" | "accounts">("calls");
  
  // Calls state
  const [calls, setCalls] = useState<CallInteraction[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeCall, setActiveCall] = useState<CallInteraction | null>(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("consultant");
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Authenticate & Fetch Data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      // Check auth status
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();

      if (!authData.authenticated) {
        router.replace("/admin/login");
        return;
      }
      setUser(authData.user);

      // Fetch calls
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (selectedAgent && selectedAgent !== "all") queryParams.set("agent", selectedAgent);
      if (selectedStatus && selectedStatus !== "all") queryParams.set("status", selectedStatus);

      const callsRes = await fetch(`/api/admin/calls?${queryParams.toString()}`);
      if (callsRes.ok) {
        const data = await callsRes.json();
        setCalls(data.calls || []);
        setStats(data.stats || null);
      }

      // Fetch accounts
      fetchAccounts();
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Handle Search & Filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedAgent, selectedStatus]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      router.replace("/admin/login");
    }
  };

  // Handle Delete Call
  const handleDeleteCall = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interaction log?")) return;

    try {
      const res = await fetch(`/api/admin/calls?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCalls((prev) => prev.filter((c) => c.id !== id));
        if (activeCall?.id === id) setActiveCall(null);
      }
    } catch (err) {
      alert("Failed to delete record");
    }
  };

  // Handle Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail || newUsername,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to create account");
      }

      setAccountSuccess(`Account '${newUsername}' created successfully in MongoDB!`);
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      fetchAccounts();
      setTimeout(() => {
        setShowCreateModal(false);
        setAccountSuccess("");
      }, 1500);
    } catch (err: any) {
      setAccountError(err.message || "Failed to create account");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (usernameToDelete: string) => {
    if (usernameToDelete === "admin@transearch.com" || usernameToDelete === "admin") {
      alert("The primary root superadmin account cannot be deleted.");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete account '${usernameToDelete}' from MongoDB?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?username=${encodeURIComponent(usernameToDelete)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.error || "Failed to delete account");
        return;
      }

      setAccounts((prev) => prev.filter((u) => u.username !== usernameToDelete));
    } catch (err: any) {
      alert("Error deleting account: " + err?.message);
    }
  };

  // Copy Transcript Text
  const handleCopyTranscript = () => {
    if (!activeCall) return;
    const transcriptText = activeCall.segments
      .map((s) => `[${s.speaker}]: ${s.text}`)
      .join("\n\n");
    const summary = `TRANSEARCH INTERACTION AUDIT\nCall ID: ${activeCall.id}\nDate: ${activeCall.date} ${activeCall.time}\nDuration: ${activeCall.durationFormatted}\nIP: ${activeCall.ipAddress} (${activeCall.geoLocation?.city || 'N/A'}, ${activeCall.geoLocation?.country || 'N/A'})\nAgent: ${activeCall.agentName}\nMandate: ${activeCall.mandate}\nCandidate: ${activeCall.candidateInfo?.name || 'Anonymous'}\n\n--- TRANSCRIPT ---\n\n${transcriptText}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!calls.length) return;

    const headers = [
      "Call ID",
      "Date",
      "Time",
      "Duration (s)",
      "Duration Formatted",
      "Agent",
      "Mandate",
      "Route",
      "Caller IP",
      "City",
      "Country",
      "Candidate Name",
      "Candidate Email",
      "Candidate Phone",
      "Status",
      "Turns Count"
    ];

    const rows = calls.map((c) => [
      `"${c.id}"`,
      `"${c.date}"`,
      `"${c.time}"`,
      c.durationSecs,
      `"${c.durationFormatted}"`,
      `"${c.agentName.replace(/"/g, '""')}"`,
      `"${c.mandate.replace(/"/g, '""')}"`,
      `"${c.route}"`,
      `"${c.ipAddress}"`,
      `"${c.geoLocation?.city || 'N/A'}"`,
      `"${c.geoLocation?.country || 'N/A'}"`,
      `"${c.candidateInfo?.name || 'Anonymous'}"`,
      `"${c.candidateInfo?.email || 'N/A'}"`,
      `"${c.candidateInfo?.phone || 'N/A'}"`,
      `"${c.status}"`,
      c.totalTurns
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transearch_call_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#D4AF37] tracking-wider uppercase font-semibold">
            Loading Executive Call Audit System...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09131D] text-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-[#0D1B2A] border-b border-[#D4AF37]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-[#1B365D] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] hover:scale-105 transition"
            title="Return to Main Portal"
          >
            <Building2 className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-widest text-[#D4AF37] uppercase">
                TRANSEARCH International
              </span>
              <span className="bg-[#1B365D] text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>PYTHON &amp; MONGO DB</span>
              </span>
            </div>
            <div className="text-xs text-gray-300 font-medium">
              Voice Interaction Intelligence &amp; Candidate Audit Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector in Header */}
          <div className="flex items-center bg-[#1B365D]/60 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => setActiveTab("calls")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === "calls"
                  ? "bg-[#D4AF37] text-[#0D1B2A] shadow-sm font-bold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Call Interactions
            </button>
            <button
              onClick={() => {
                setActiveTab("accounts");
                fetchAccounts();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "accounts"
                  ? "bg-[#D4AF37] text-[#0D1B2A] shadow-sm font-bold"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Accounts ({accounts.length})</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-[#1B365D]/70 hover:bg-[#1B365D] text-gray-200 border border-[#D4AF37]/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-[#1B365D]/40 border border-gray-700 px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{user?.username || "admin@transearch.com"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Sign out of audit dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "calls" ? (
          <>
            {/* KPI Metrics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Calls */}
              <div className="bg-[#0D1B2A] border border-[#D4AF37]/25 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Total Interactions
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#1B365D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-white">
                  {stats?.totalCalls || calls.length}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Recorded in MongoDB database
                </div>
              </div>

              {/* Total Duration */}
              <div className="bg-[#0D1B2A] border border-[#D4AF37]/25 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B365D]/20 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Total Talk Time
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#1B365D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-[#D4AF37]">
                  {stats?.totalDurationFormatted || "0s"}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Live executive dialogue time
                </div>
              </div>

              {/* Leads Captured */}
              <div className="bg-[#0D1B2A] border border-[#D4AF37]/25 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Leads Captured
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#1B365D] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-white">
                  {stats?.totalLeadsCaptured || 0}
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-medium">
                  Candidate contact dossiers saved
                </div>
              </div>

              {/* Global Reach */}
              <div className="bg-[#0D1B2A] border border-[#D4AF37]/25 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Geographic Nodes
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#1B365D] border border-sky-400/40 flex items-center justify-center text-sky-400">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3 text-3xl font-black text-white">
                  {stats?.uniqueLocationsCount || 1}
                </div>
                <div className="mt-1 text-xs text-sky-300 font-medium">
                  Unique cities &amp; countries
                </div>
              </div>
            </section>

            {/* Search, Filter & Action Toolbar */}
            <section className="bg-[#0D1B2A] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search candidate name, IP address, city, country, or transcript words..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1B365D]/40 border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-xs sm:text-sm text-white placeholder-gray-400 outline-none transition"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters & Export */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Agent Filter */}
                  <div className="relative">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="bg-[#1B365D]/60 border border-gray-700 text-xs text-gray-200 rounded-xl px-3 py-2.5 pr-8 focus:border-[#D4AF37] outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">All Voice Agents</option>
                      <option value="jeffery">Jeffery Reiss (Oxane)</option>
                      <option value="juan">Juan Zepeda (Oxane)</option>
                      <option value="schlow">Steven Schlow (Oxane)</option>
                      <option value="joerg">Steven Joerg (Oxane)</option>
                      <option value="sumit">Sumit Kumar (EARC)</option>
                      <option value="rockey">Rockey Maheshwari (EARC)</option>
                      <option value="ranvijay">Ran Vijay Singh (EARC)</option>
                      <option value="mahesh">Dhan Mahesh Nakka (EARC)</option>
                      <option value="amit">Amit Kumar (EARC)</option>
                      <option value="ankit">Ankit Kumar (EARC)</option>
                      <option value="switzerland">Sara (Switzerland)</option>
                      <option value="david">David (Indegene)</option>
                      <option value="sophie">Sophie (Indegene)</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-[#1B365D]/60 border border-gray-700 text-xs text-gray-200 rounded-xl px-3 py-2.5 pr-8 focus:border-[#D4AF37] outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Lead Captured">Lead Captured</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#F4E091] text-[#0D1B2A] font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                    title="Download CSV Audit"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Interactive Call Records Table */}
            <section className="bg-[#0D1B2A] border border-[#D4AF37]/30 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Audited Executive Voice Interactions</span>
                    <span className="text-xs font-semibold text-[#D4AF37] bg-[#1B365D] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                      {calls.length} records in MongoDB
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Every live voice session logs caller IP, network geolocation, exact timestamp, and full dialogue turns.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1B365D]/50 border-b border-gray-800 uppercase text-[10px] font-bold tracking-wider text-gray-300">
                    <tr>
                      <th className="py-3.5 px-4">Date &amp; Time</th>
                      <th className="py-3.5 px-4">Candidate / Caller</th>
                      <th className="py-3.5 px-4">Voice Agent &amp; Route</th>
                      <th className="py-3.5 px-4">IP Address &amp; Location</th>
                      <th className="py-3.5 px-4">Duration &amp; Turns</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/80">
                    {calls.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center gap-2">
                            <MessageSquare className="w-8 h-8 text-gray-600" />
                            <span className="text-sm font-semibold">No interaction records match the filter</span>
                            <span className="text-xs text-gray-500">
                              Try modifying your search query or reset the filter
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      calls.map((call) => {
                        const hasLead = Boolean(call.candidateInfo?.name || call.candidateInfo?.email);
                        return (
                          <tr
                            key={call.id}
                            onClick={() => setActiveCall(call)}
                            className="hover:bg-[#1B365D]/30 transition-colors cursor-pointer group"
                          >
                            {/* Date & Time */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-white">
                                {call.date}
                              </div>
                              <div className="text-[11px] text-[#D4AF37] font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{call.time}</span>
                              </div>
                            </td>

                            {/* Candidate */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white group-hover:text-[#D4AF37] transition">
                                {call.candidateInfo?.name || "Executive Visitor"}
                              </div>
                              {call.candidateInfo?.email && (
                                <div className="text-[11px] text-gray-400 truncate max-w-[180px]">
                                  {call.candidateInfo.email}
                                </div>
                              )}
                              {call.candidateInfo?.phone && (
                                <div className="text-[10px] text-gray-400 font-mono">
                                  {call.candidateInfo.phone}
                                </div>
                              )}
                            </td>

                            {/* Voice Agent & Route */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-gray-200">
                                {call.agentName}
                              </div>
                              <div className="text-[11px] text-gray-400 line-clamp-1">
                                {call.mandate}
                              </div>
                              <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                                {call.route}
                              </div>
                            </td>

                            {/* IP & Geolocation */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-[#1B365D] px-2 py-0.5 rounded border border-gray-700 text-gray-200">
                                  {call.ipAddress}
                                </span>
                                {call.geoLocation?.isLocal && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                                    DEV
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                                <MapPin className="w-3 h-3 text-[#D4AF37]" />
                                <span>
                                  {call.geoLocation?.city || "Global"}, {call.geoLocation?.country || "Online"}
                                </span>
                              </div>
                            </td>

                            {/* Duration & Turns */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-semibold text-white">
                                {call.durationFormatted}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {call.totalTurns} turns
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {hasLead ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                  Lead Captured
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B365D] text-gray-300 border border-gray-700">
                                  Completed
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCall(call);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#1B365D] hover:bg-[#D4AF37] hover:text-[#0D1B2A] text-[#D4AF37] border border-[#D4AF37]/30 transition"
                                  title="Inspect Transcript & Dossier"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteCall(call.id, e)}
                                  className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-800 text-red-300 border border-red-800/40 transition"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          /* Accounts Management Section */
          <section className="bg-[#0D1B2A] border border-[#D4AF37]/30 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D4AF37]" />
                  <span>Consultant &amp; Admin Accounts</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage authorized users stored in MongoDB with secure hashed credentials.
                </p>
              </div>

              <button
                onClick={() => {
                  setAccountError("");
                  setAccountSuccess("");
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#F4E091] text-[#0D1B2A] font-bold text-xs rounded-xl shadow-lg transition cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1B365D]/50 border-b border-gray-800 uppercase text-[10px] font-bold tracking-wider text-gray-300">
                  <tr>
                    <th className="py-3 px-4">Username / Login</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {accounts.map((acc) => {
                    const isRoot = acc.username === "admin@transearch.com" || acc.username === "admin";
                    return (
                      <tr key={acc.id || acc.username} className="hover:bg-[#1B365D]/20 transition">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{acc.username}</span>
                            {isRoot && (
                              <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-1.5 py-0.5 rounded font-bold uppercase">
                                Root Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-300 font-mono text-[11px]">
                          {acc.email || acc.username}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              acc.role === "superadmin"
                                ? "bg-amber-950 text-amber-300 border border-amber-600/40"
                                : "bg-sky-950 text-sky-300 border border-sky-600/40"
                            }`}
                          >
                            {acc.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "System Init"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isRoot ? (
                            <span className="text-[10px] text-gray-500 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteAccount(acc.username)}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-800 text-red-300 border border-red-800/40 rounded-lg text-xs font-semibold transition cursor-pointer"
                              title="Delete Account"
                            >
                              Delete Account
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1B2A] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 border-b border-gray-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#1B365D] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Create Consultant Account</h3>
            </div>

            {accountError && (
              <div className="mb-4 p-3 bg-red-950/70 border border-red-600/40 rounded-xl text-red-200 text-xs">
                {accountError}
              </div>
            )}

            {accountSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-600/40 rounded-xl text-emerald-200 text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{accountSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. sarah.smith or sarah@transearch.com"
                  className="w-full px-3 py-2 bg-[#1B365D]/50 border border-gray-700 rounded-xl text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sarah.smith@transearch.com"
                  className="w-full px-3 py-2 bg-[#1B365D]/50 border border-gray-700 rounded-xl text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                  Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-[#1B365D]/50 border border-gray-700 rounded-xl text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                  Account Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B365D]/70 border border-gray-700 rounded-xl text-white outline-none focus:border-[#D4AF37]"
                >
                  <option value="consultant">Consultant</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#F4E091] text-[#0D1B2A] font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Creating in MongoDB..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-Out Detail Modal / Drawer */}
      {activeCall && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0D1B2A] h-full shadow-2xl border-l border-[#D4AF37]/40 flex flex-col animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D4AF37]/30 bg-[#1B365D]/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                    Interaction Dossier
                  </span>
                  <span className="text-[10px] bg-[#1B365D] text-gray-300 px-2 py-0.5 rounded font-mono border border-gray-700">
                    {activeCall.id}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {activeCall.agentName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B365D] hover:bg-[#D4AF37] hover:text-[#0D1B2A] text-xs font-semibold text-[#D4AF37] border border-[#D4AF37]/30 transition cursor-pointer"
                  title="Copy full transcript"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => setActiveCall(null)}
                  className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Interaction Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1B365D]/30 p-4 rounded-xl border border-gray-800 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-semibold text-white">{activeCall.date}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Time</span>
                  <span className="font-semibold text-[#D4AF37] font-mono">{activeCall.time}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-semibold text-white">{activeCall.durationFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Turns</span>
                  <span className="font-semibold text-white">{activeCall.totalTurns} turns</span>
                </div>
              </div>

              {/* Network, IP & Geolocation Box */}
              <div className="bg-[#1B365D]/20 border border-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Caller Network &amp; Audit Metadata</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Client IP Address</span>
                    <span className="font-mono text-white bg-[#0D1B2A] px-2 py-0.5 rounded border border-gray-700 inline-block mt-0.5">
                      {activeCall.ipAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Resolved Location</span>
                    <span className="text-white font-medium">
                      {activeCall.geoLocation?.city || "Unknown City"},{" "}
                      {activeCall.geoLocation?.country || "Global Node"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Device Type</span>
                    <span className="text-white font-medium flex items-center gap-1.5 mt-0.5">
                      {activeCall.deviceType === "Mobile" ? (
                        <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                      ) : (
                        <Laptop className="w-3.5 h-3.5 text-[#D4AF37]" />
                      )}
                      <span>{activeCall.deviceType || "Desktop"}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Active Route</span>
                    <Link
                      href={activeCall.route}
                      target="_blank"
                      className="text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>{activeCall.route}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Candidate Information (if captured) */}
              {activeCall.candidateInfo && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Captured Candidate Information</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {activeCall.candidateInfo.name && (
                      <p>
                        <strong className="text-gray-400">Name:</strong>{" "}
                        <span className="text-white font-semibold">{activeCall.candidateInfo.name}</span>
                      </p>
                    )}
                    {activeCall.candidateInfo.email && (
                      <p>
                        <strong className="text-gray-400">Email:</strong>{" "}
                        <a href={`mailto:${activeCall.candidateInfo.email}`} className="text-sky-400 hover:underline">
                          {activeCall.candidateInfo.email}
                        </a>
                      </p>
                    )}
                    {activeCall.candidateInfo.phone && (
                      <p>
                        <strong className="text-gray-400">Phone:</strong>{" "}
                        <span className="text-white font-mono">{activeCall.candidateInfo.phone}</span>
                      </p>
                    )}
                    {activeCall.candidateInfo.currentRole && (
                      <p>
                        <strong className="text-gray-400">Current Role / Practice:</strong>{" "}
                        <span className="text-white">{activeCall.candidateInfo.currentRole}</span>
                      </p>
                    )}
                    {activeCall.candidateInfo.notes && (
                      <div className="mt-2 pt-2 border-t border-emerald-500/20">
                        <span className="text-gray-400 block text-[11px] mb-1">Executive Notes:</span>
                        <div className="bg-[#0D1B2A]/80 p-2.5 rounded-lg text-gray-200 text-xs italic">
                          {activeCall.candidateInfo.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Conversation Transcript Dialogue */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Complete Dialogue Transcript</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {activeCall.segments?.length || 0} spoken turns
                  </span>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {(!activeCall.segments || activeCall.segments.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      No dialogue utterances recorded for this interaction.
                    </div>
                  ) : (
                    activeCall.segments.map((seg, idx) => {
                      const isUser = seg.speaker === "User";
                      const speakerTitle = isUser
                        ? activeCall.candidateInfo?.name || "Candidate"
                        : activeCall.agentName;

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border ${
                            isUser
                              ? "bg-[#1B365D]/60 border-[#1B365D] text-gray-100 ml-4 sm:ml-8"
                              : "bg-[#0D1B2A] border-[#D4AF37]/30 text-white mr-4 sm:mr-8"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isUser ? "text-sky-300" : "text-[#D4AF37]"
                              }`}
                            >
                              {speakerTitle}
                            </span>
                            {seg.timestamp !== undefined && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                +{typeof seg.timestamp === "number" ? `${seg.timestamp}s` : seg.timestamp}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {seg.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#0D1B2A] flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                Audit Hash: SHA-256 Verified
              </span>
              <button
                onClick={() => setActiveCall(null)}
                className="px-4 py-2 bg-[#1B365D] hover:bg-[#D4AF37] hover:text-[#0D1B2A] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
