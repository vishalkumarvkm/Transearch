"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PhoneCall,
  Clock,
  Users,
  MapPin,
  Search,
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
  UserPlus,
  AlertTriangle,
  Info,
} from "lucide-react";
import { CallInteraction, CallStats } from "@/lib/types/interaction";

// ─── Shared Input/Select class ───────────────────────────────────────────────
const inputCls =
  "w-full px-3.5 py-2.5 bg-[#111736] border border-slate-700 focus:border-[#cca352] text-sm text-white placeholder-slate-500 outline-none transition-colors rounded-none";
const selectCls =
  "bg-[#111736] border border-slate-700 text-sm text-slate-200 px-3 py-2 focus:border-[#cca352] outline-none cursor-pointer appearance-none rounded-none";

// ─── Types ───────────────────────────────────────────────────────────────────
type ConfirmState = {
  open: boolean;
  message: string;
  description?: string;
  onConfirm: () => void;
  danger?: boolean;
};
type ToastState = { open: boolean; message: string; type: "success" | "error" | "info" };

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

  // ── Custom dialog/toast state (replaces window.confirm & alert) ─────────────
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false, message: "", onConfirm: () => {}, danger: true,
  });
  const [toast, setToast] = useState<ToastState>({ open: false, message: "", type: "info" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Open a custom in-app confirm dialog */
  const showConfirm = useCallback(
    (message: string, description: string | undefined, onConfirm: () => void, danger = true) => {
      setConfirm({ open: true, message, description, onConfirm, danger });
    },
    []
  );

  /** Show a brief in-app toast notification */
  const showToast = useCallback((message: string, type: ToastState["type"] = "info") => {
    setToast({ open: true, message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, open: false })), 3500);
  }, []);

  // Dynamically derive unique agents from call data
  const uniqueAgents = useMemo(() => {
    const seen = new Set<string>();
    return calls.filter((c) => {
      if (!c.agentName || seen.has(c.agentName)) return false;
      seen.add(c.agentName);
      return true;
    });
  }, [calls]);

  // ── Data Fetching ───────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      if (!authData.authenticated) { router.replace("/admin/login"); return; }
      setUser(authData.user);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedAgent !== "all") params.set("agent", selectedAgent);
      if (selectedStatus !== "all") params.set("status", selectedStatus);

      const callsRes = await fetch(`/api/admin/calls?${params}`);
      if (callsRes.ok) {
        const data = await callsRes.json();
        setCalls(data.calls || []);
        setStats(data.stats || null);
      }
      fetchAccounts();
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) { const data = await res.json(); setAccounts(data.users || []); }
    } catch (err) { console.error("Accounts error:", err); }
  };

  useEffect(() => { fetchData(); }, [router]);
  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search, selectedAgent, selectedStatus]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  };

  const handleDeleteCall = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      "Delete interaction record?",
      "This will permanently remove the call log and transcript from the database.",
      async () => {
        const res = await fetch(`/api/admin/calls?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          setCalls((prev) => prev.filter((c) => c.id !== id));
          if (activeCall?.id === id) setActiveCall(null);
          showToast("Record deleted.", "success");
        } else {
          showToast("Failed to delete record.", "error");
        }
      }
    );
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(""); setAccountSuccess(""); setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, email: newEmail || newUsername, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to create account");
      setAccountSuccess(`Account '${newUsername}' created successfully.`);
      setNewUsername(""); setNewEmail(""); setNewPassword("");
      fetchAccounts();
      setTimeout(() => { setShowCreateModal(false); setAccountSuccess(""); }, 1500);
    } catch (err: any) {
      setAccountError(err.message || "Failed to create account");
    } finally { setActionLoading(false); }
  };

  const handleDeleteAccount = async (uname: string) => {
    if (uname === "admin@transearch.com" || uname === "admin") {
      showToast("The root admin account cannot be deleted.", "error");
      return;
    }
    showConfirm(
      `Delete account?`,
      `This will permanently remove '${uname}' from the database.`,
      async () => {
        const res = await fetch(`/api/admin/users?username=${encodeURIComponent(uname)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.detail || data.error || "Failed to delete account.", "error");
          return;
        }
        setAccounts((prev) => prev.filter((u) => u.username !== uname));
        showToast(`Account '${uname}' deleted.`, "success");
      }
    );
  };

  const handleCopyTranscript = () => {
    if (!activeCall) return;
    const text = activeCall.segments.map((s) => `[${s.speaker}]: ${s.text}`).join("\n\n");
    const full = `TRANSEARCH INTERACTION AUDIT\nCall ID: ${activeCall.id}\nDate: ${activeCall.date} ${activeCall.time}\nDuration: ${activeCall.durationFormatted}\nIP: ${activeCall.ipAddress} (${activeCall.geoLocation?.city || "N/A"}, ${activeCall.geoLocation?.country || "N/A"})\nAgent: ${activeCall.agentName}\nMandate: ${activeCall.mandate}\nCandidate: ${activeCall.candidateInfo?.name || "Anonymous"}\n\n--- TRANSCRIPT ---\n\n${text}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!calls.length) return;
    const headers = ["Call ID","Date","Time","Duration (s)","Duration","Agent","Mandate","Route","IP","City","Country","Candidate Name","Candidate Email","Candidate Phone","Status","Turns"];
    const rows = calls.map((c) => [
      `"${c.id}"`, `"${c.date}"`, `"${c.time}"`, c.durationSecs, `"${c.durationFormatted}"`,
      `"${c.agentName.replace(/"/g, '""')}"`, `"${c.mandate.replace(/"/g, '""')}"`, `"${c.route}"`,
      `"${c.ipAddress}"`, `"${c.geoLocation?.city || "N/A"}"`, `"${c.geoLocation?.country || "N/A"}"`,
      `"${c.candidateInfo?.name || "Anonymous"}"`, `"${c.candidateInfo?.email || "N/A"}"`,
      `"${c.candidateInfo?.phone || "N/A"}"`, `"${c.status}"`, c.totalTurns,
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const a = document.createElement("a");
    a.setAttribute("href", encodeURI(csv));
    a.setAttribute("download", `transearch_calls_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#cca352] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#cca352] text-xs font-semibold tracking-[0.2em] uppercase">
            Loading Portal
          </span>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b0e26] text-white flex flex-col font-sans selection:bg-[#cca352] selection:text-[#0b0e26]">

      {/* ── Header ── */}
      <header className="border-b border-slate-800/60 sticky top-0 z-40 bg-[#0b0e26]">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="shrink-0">
            <span className="font-serif font-bold tracking-widest text-white text-sm sm:text-base uppercase select-none">
              TRANSEARCHAI.COM<span className="text-[#cca352]">.</span>
            </span>
          </Link>

          {/* Tabs */}
          <div className="flex items-center border border-slate-700 divide-x divide-slate-700">
            <button
              onClick={() => setActiveTab("calls")}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === "calls"
                  ? "bg-[#cca352] text-[#0b0e26]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Call Logs
            </button>
            <button
              onClick={() => { setActiveTab("accounts"); fetchAccounts(); }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
                activeTab === "accounts"
                  ? "bg-[#cca352] text-[#0b0e26]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3 h-3" />
              Accounts ({accounts.length})
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={refreshing}
              title="Refresh"
              className="p-2 border border-slate-700 hover:border-[#cca352] text-slate-400 hover:text-[#cca352] transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <span className="hidden sm:block text-xs text-slate-500 border border-slate-800 px-3 py-1.5">
              {user?.username}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-5 sm:px-10 py-10 space-y-8">

        {activeTab === "calls" ? (
          <>
            {/* KPI Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Interactions", value: stats?.totalCalls ?? calls.length, icon: PhoneCall, sub: "Logged sessions" },
                { label: "Total Talk Time", value: stats?.totalDurationFormatted ?? "0s", icon: Clock, sub: "Voice dialogue time", gold: true },
                { label: "Leads Captured", value: stats?.totalLeadsCaptured ?? 0, icon: Users, sub: "Candidate dossiers" },
                { label: "Geographic Nodes", value: stats?.uniqueLocationsCount ?? 0, icon: Globe, sub: "Unique cities & countries" },
              ].map(({ label, value, icon: Icon, sub, gold }) => (
                <div key={label} className="border border-slate-800 p-5 bg-[#0b0e26] hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </span>
                    <Icon className={`w-4 h-4 ${gold ? "text-[#cca352]" : "text-slate-600"}`} />
                  </div>
                  <div className={`font-serif text-3xl font-normal ${gold ? "text-[#cca352]" : "text-white"}`}>
                    {value}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{sub}</p>
                </div>
              ))}
            </section>

            {/* Toolbar */}
            <section className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by candidate, IP, city, country, or transcript…"
                  className={`${inputCls} pl-10`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Agent filter — dynamic from data */}
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className={selectCls}
                >
                  <option value="all">All Agents</option>
                  {uniqueAgents.map((c) => (
                    <option key={c.agentName} value={c.agentName}>{c.agentName}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="all">All Statuses</option>
                  <option value="Lead Captured">Lead Captured</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Export */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-[#cca352] hover:bg-[#d8b363] text-[#0b0e26] font-bold text-xs uppercase tracking-wider px-4 py-2.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </section>

            {/* Table */}
            <section className="border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-base font-normal text-white">
                    Voice Interaction Logs
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {calls.length} record{calls.length !== 1 ? "s" : ""} — live from database
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 bg-[#0b0e26]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Agent & Route</th>
                      <th className="py-3 px-4 font-semibold">IP & Location</th>
                      <th className="py-3 px-4 font-semibold">Duration</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {calls.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          <MessageSquare className="w-7 h-7 text-slate-700 mx-auto mb-3" />
                          <p className="text-slate-500 text-sm">No records match your filter</p>
                          <p className="text-slate-700 text-xs mt-1">Adjust search or reset filters</p>
                        </td>
                      </tr>
                    ) : (
                      calls.map((call) => {
                        const hasLead = Boolean(call.candidateInfo?.name || call.candidateInfo?.email);
                        return (
                          <tr
                            key={call.id}
                            onClick={() => setActiveCall(call)}
                            className="hover:bg-slate-900/40 transition cursor-pointer group"
                          >
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-medium text-white">{call.date}</div>
                              <div className="text-[11px] text-[#cca352] font-mono flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {call.time}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-white group-hover:text-[#cca352] transition">
                                {call.candidateInfo?.name || "Anonymous Visitor"}
                              </div>
                              {call.candidateInfo?.email && (
                                <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                  {call.candidateInfo.email}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-300">{call.agentName}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{call.mandate}</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2 py-0.5 border border-slate-800">
                                {call.ipAddress}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                <MapPin className="w-2.5 h-2.5 text-[#cca352]" />
                                {call.geoLocation?.city || "—"}, {call.geoLocation?.country || "—"}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="text-white">{call.durationFormatted}</div>
                              <div className="text-[11px] text-slate-500">{call.totalTurns} turns</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {hasLead ? (
                                <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                                  Lead Captured
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 bg-slate-900 text-slate-400 border border-slate-700">
                                  Completed
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveCall(call); }}
                                  className="p-1.5 border border-slate-700 hover:border-[#cca352] text-slate-400 hover:text-[#cca352] transition"
                                  title="View transcript"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteCall(call.id, e)}
                                  className="p-1.5 border border-slate-700 hover:border-red-800 text-slate-500 hover:text-red-400 transition"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          /* ── Accounts Tab ── */
          <section className="border border-slate-800">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-base font-normal text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#cca352]" />
                  Consultant &amp; Admin Accounts
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage authorized portal users — stored with hashed credentials.
                </p>
              </div>
              <button
                onClick={() => { setAccountError(""); setAccountSuccess(""); setShowCreateModal(true); }}
                className="inline-flex items-center gap-2 bg-[#cca352] hover:bg-[#d8b363] text-[#0b0e26] font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                New Account
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-5 font-semibold">Username</th>
                    <th className="py-3 px-5 font-semibold">Email</th>
                    <th className="py-3 px-5 font-semibold">Role</th>
                    <th className="py-3 px-5 font-semibold">Created</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                        No accounts found.
                      </td>
                    </tr>
                  ) : accounts.map((acc) => {
                    const isRoot = acc.username === "admin@transearch.com" || acc.username === "admin";
                    return (
                      <tr key={acc.id || acc.username} className="hover:bg-slate-900/30 transition">
                        <td className="py-3.5 px-5 font-medium text-white">
                          <div className="flex items-center gap-2">
                            {acc.username}
                            {isRoot && (
                              <span className="text-[9px] bg-[#cca352]/10 text-[#cca352] border border-[#cca352]/30 px-1.5 py-0.5 uppercase font-bold tracking-wide">
                                Root
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                          {acc.email || acc.username}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-0.5 border ${
                            acc.role === "superadmin"
                              ? "bg-amber-950/40 text-amber-400 border-amber-800/50"
                              : "bg-slate-900 text-slate-400 border-slate-700"
                          }`}>
                            {acc.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500">
                          {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isRoot ? (
                            <span className="text-[10px] text-slate-700 italic">Protected</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteAccount(acc.username)}
                              className="text-xs text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 transition cursor-pointer"
                            >
                              Delete
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

      {/* ── Create Account Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e26] border border-slate-700 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-slate-800">
              <p className="text-[#cca352] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">
                Portal Administration
              </p>
              <h3 className="font-serif text-lg font-normal text-white">Create Account</h3>
            </div>

            {accountError && (
              <div className="mx-6 mt-4 border border-red-800/50 bg-red-950/20 px-4 py-3 text-red-300 text-xs">
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="mx-6 mt-4 border border-emerald-800/50 bg-emerald-950/20 px-4 py-3 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5" /> {accountSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Username
                </label>
                <input type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="sarah.smith or sarah@transearch.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Email (Optional)
                </label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sarah@transearch.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Password
                </label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters" className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Role
                </label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className={`${selectCls} w-full`}>
                  <option value="consultant">Consultant</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-2.5 bg-[#cca352] hover:bg-[#d8b363] text-[#0b0e26] font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50">
                  {actionLoading ? "Creating…" : "Create Account"}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Call Detail Drawer ── */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0b0e26] border-l border-slate-700 h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between shrink-0">
              <div>
                <p className="text-[#cca352] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">
                  Interaction Record
                </p>
                <h3 className="font-serif text-lg font-normal text-white">{activeCall.agentName}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{activeCall.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1.5 text-xs border border-slate-700 hover:border-[#cca352] text-slate-400 hover:text-[#cca352] px-3 py-1.5 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setActiveCall(null)}
                  className="p-1.5 border border-slate-700 hover:border-slate-500 text-slate-500 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-slate-800 p-4">
                {[
                  { label: "Date", value: activeCall.date },
                  { label: "Time", value: activeCall.time, mono: true, gold: true },
                  { label: "Duration", value: activeCall.durationFormatted },
                  { label: "Turns", value: `${activeCall.totalTurns} turns` },
                ].map(({ label, value, mono, gold }) => (
                  <div key={label}>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
                    <span className={`text-sm font-medium ${gold ? "text-[#cca352]" : "text-white"} ${mono ? "font-mono" : ""}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Network Info */}
              <div className="border border-slate-800 p-4">
                <h4 className="text-[10px] text-[#cca352] uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Caller Network
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">IP Address</span>
                    <span className="font-mono text-white bg-slate-900 border border-slate-800 px-2 py-0.5 inline-block">
                      {activeCall.ipAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Location</span>
                    <span className="text-white">
                      {activeCall.geoLocation?.city || "—"}, {activeCall.geoLocation?.country || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Device</span>
                    <span className="text-white flex items-center gap-1.5">
                      {activeCall.deviceType === "Mobile"
                        ? <Smartphone className="w-3.5 h-3.5 text-[#cca352]" />
                        : <Laptop className="w-3.5 h-3.5 text-[#cca352]" />}
                      {activeCall.deviceType || "Desktop"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Route</span>
                    <a href={activeCall.route} target="_blank" rel="noreferrer"
                      className="text-[#cca352] hover:underline flex items-center gap-1">
                      {activeCall.route}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Candidate Info */}
              {activeCall.candidateInfo && (
                <div className="border border-emerald-900/50 p-4">
                  <h4 className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Candidate Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    {activeCall.candidateInfo.name && (
                      <p><span className="text-slate-500">Name: </span><span className="text-white font-medium">{activeCall.candidateInfo.name}</span></p>
                    )}
                    {activeCall.candidateInfo.email && (
                      <p><span className="text-slate-500">Email: </span>
                        <a href={`mailto:${activeCall.candidateInfo.email}`} className="text-[#cca352] hover:underline">
                          {activeCall.candidateInfo.email}
                        </a>
                      </p>
                    )}
                    {activeCall.candidateInfo.phone && (
                      <p><span className="text-slate-500">Phone: </span><span className="text-white font-mono">{activeCall.candidateInfo.phone}</span></p>
                    )}
                    {activeCall.candidateInfo.currentRole && (
                      <p><span className="text-slate-500">Role: </span><span className="text-white">{activeCall.candidateInfo.currentRole}</span></p>
                    )}
                    {activeCall.candidateInfo.notes && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <span className="text-slate-500 block mb-1">Notes:</span>
                        <p className="text-slate-300 italic">{activeCall.candidateInfo.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] text-[#cca352] uppercase tracking-widest font-semibold flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Transcript
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {activeCall.segments?.length || 0} turns
                  </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {(!activeCall.segments || activeCall.segments.length === 0) ? (
                    <p className="text-slate-600 text-sm text-center py-8">No transcript recorded.</p>
                  ) : (
                    activeCall.segments.map((seg, idx) => {
                      const isUser = seg.speaker === "User";
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 border text-xs ${
                            isUser
                              ? "border-slate-700 bg-slate-900/40 ml-6 sm:ml-10"
                              : "border-[#cca352]/20 bg-[#cca352]/5 mr-6 sm:mr-10"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              isUser ? "text-slate-400" : "text-[#cca352]"
                            }`}>
                              {isUser ? activeCall.candidateInfo?.name || "Candidate" : activeCall.agentName}
                            </span>
                            {seg.timestamp !== undefined && (
                              <span className="text-[10px] text-slate-600 font-mono">
                                +{typeof seg.timestamp === "number" ? `${seg.timestamp}s` : seg.timestamp}
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed text-slate-200 whitespace-pre-wrap">{seg.text}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setActiveCall(null)}
                className="px-6 py-2.5 border border-slate-700 hover:border-[#cca352] text-slate-400 hover:text-[#cca352] text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Custom Confirm Dialog (replaces window.confirm) ── */}
      {confirm.open && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e26] border border-slate-700 w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-800 flex items-start gap-3">
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center border ${
                confirm.danger
                  ? "border-red-800/60 text-red-400"
                  : "border-[#cca352]/40 text-[#cca352]"
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{confirm.message}</p>
                {confirm.description && (
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{confirm.description}</p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="px-6 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirm((c) => ({ ...c, open: false }))}
                className="px-5 py-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirm((c) => ({ ...c, open: false }));
                  confirm.onConfirm();
                }}
                className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  confirm.danger
                    ? "bg-red-700 hover:bg-red-600 text-white border border-red-700"
                    : "bg-[#cca352] hover:bg-[#d8b363] text-[#0b0e26]"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification (replaces alert) ── */}
      <div
        className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 px-5 py-3.5 border shadow-xl transition-all duration-300 max-w-sm ${
          toast.open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        } ${
          toast.type === "success"
            ? "bg-[#0b0e26] border-emerald-800/60 text-emerald-300"
            : toast.type === "error"
            ? "bg-[#0b0e26] border-red-800/60 text-red-300"
            : "bg-[#0b0e26] border-slate-700 text-slate-300"
        }`}
      >
        {toast.type === "success" ? (
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
        ) : toast.type === "error" ? (
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
        ) : (
          <Info className="w-4 h-4 shrink-0 text-[#cca352]" />
        )}
        <span className="text-xs font-medium">{toast.message}</span>
        <button
          onClick={() => setToast((t) => ({ ...t, open: false }))}
          className="ml-2 text-slate-600 hover:text-white transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
