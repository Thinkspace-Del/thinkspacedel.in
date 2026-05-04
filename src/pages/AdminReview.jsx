import React, { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import {
  adminInvoke,
  clearStoredAdminKey,
  getStoredAdminKey,
  setStoredAdminKey,
} from "../lib/adminApi";

function deriveStatus(row) {
  const explicit = String(row?.status || "")
    .trim()
    .toLowerCase();
  if (["pending", "approved", "rejected"].includes(explicit)) return explicit;
  if (
    String(row?.role || "")
      .trim()
      .toLowerCase() === "builder"
  )
    return "approved";
  return "pending";
}

function getInitials(name) {
  const safe = String(name ?? "").trim();
  if (!safe) return "??";
  return (
    safe
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "??"
  );
}

function getNameDisplay(name, maxWords = 3, maxChars = 28) {
  const full = String(name ?? "").trim();
  if (!full) return { full: "Unnamed applicant" };
  const capped = full.split(/\s+/).filter(Boolean).slice(0, maxWords).join(" ");
  return {
    full:
      capped.length > maxChars ? `${capped.slice(0, maxChars - 1)}…` : capped,
  };
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function statusChip(status) {
  const base =
    "inline-flex items-center gap-2 px-3 py-1 text-[10px] font-mono uppercase tracking-widest border";
  if (status === "approved")
    return `${base} bg-foreground/90 text-background border-foreground/60`;
  if (status === "rejected")
    return `${base} bg-destructive text-white border-destructive`;
  return `${base} bg-zinc-900 text-foreground border-border/50`;
}

function safeLinkHref(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(v)) return `https://${v}`;
  return "";
}

function safeTrim(value) {
  return (value == null ? "" : String(value)).trim();
}

export default function AdminReview({ guardStatus, guardMessage } = {}) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [hasAdminKey, setHasAdminKey] = useState(() =>
    Boolean(getStoredAdminKey()),
  );
  const [showKeyModal, setShowKeyModal] = useState(() => !getStoredAdminKey());
  const [adminKeyDraft, setAdminKeyDraft] = useState("");
  const [actionStatus, setActionStatus] = useState("idle");
  const [actionError, setActionError] = useState("");
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  //   const [isChangingKey, setIsChangingKey] = useState(false);

  function handleSaveKey() {
    const key = adminKeyDraft.trim();
    if (!key) return;
    setStoredAdminKey(key);
    setHasAdminKey(true);
    setShowKeyModal(false);
    // setIsChangingKey(false);
    setAdminKeyDraft("");
  }

  async function loadApplicants() {
    setLoadStatus("loading");
    setLoadError("");
    try {
      const res = await adminInvoke("admin-list-applicants", {
        method: "GET",
        query: { status: statusFilter },
      });
      setRowsRaw(Array.isArray(res?.applicants) ? res.applicants : []);
      setLoadStatus("idle");
    } catch (e) {
      setRowsRaw([]);
      setLoadStatus("error");
      setLoadError(e?.message || "Unable to load.");
    }
  }

  // Load applicants when key is available
  useEffect(() => {
    if (!hasAdminKey) return;
    (async () => {
      await loadApplicants();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, hasAdminKey]);

  // Esc to close application preview modal
  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const rows = useMemo(() => {
    return (rowsRaw || [])
      .map((r) => ({ ...r, status: deriveStatus(r), createdAt: r.created_at }))
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [rowsRaw, statusFilter]);

  const selected = useMemo(
    () => rows.find((a) => a.id === selectedId) ?? null,
    [rows, selectedId],
  );

  function closeModal() {
    setSelectedId(null);
    setActionError("");
  }

  async function runAdminAction(type) {
    if (!selected) return;
    setActionError("");

    const name = adminName.trim();
    if (!name) {
      setActionError("Enter the admin name.");
      return;
    }

    setActionStatus(type === "approve" ? "approving" : "rejecting");
    try {
      await adminInvoke(type === "approve" ? "admin-approve" : "admin-reject", {
        method: "POST",
        body: { applicantId: selected.id, approvedBy: name },
      });

      setRowsRaw((prev) =>
        prev.map((r) => {
          if (r.id !== selected.id) return r;
          return type === "approve"
            ? { ...r, role: "builder", status: "approved" }
            : { ...r, status: "rejected" };
        }),
      );

      setActionStatus("idle");
      closeModal();
    } catch (e) {
      setActionError(e?.message || "Action failed.");
      setActionStatus("idle");
    }
  }

  const showGuardBanner =
    !hasAdminKey && (guardStatus === "checking" || guardStatus === "denied");

  return (
    <div className="dark h-screen bg-background text-foreground overflow-hidden">
      <Navbar showAction={false} />

      <main className="px-6 md:px-12 py-10 pt-24 h-[calc(100vh-6rem)] overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
            <section className="lg:col-span-12 h-full min-h-0 flex flex-col">
              {showGuardBanner && (
                <div className="mb-6 border border-border/30 bg-card/30 backdrop-blur-sm p-4 text-sm text-muted-foreground">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Access
                  </div>
                  <div className="mt-1">
                    {guardStatus === "checking"
                      ? "Checking admin access…"
                      : guardMessage ||
                        "Access denied. Save a valid admin key below."}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5 mb-6">
                <div className="border border-border/30 bg-card/30 backdrop-blur-sm p-6 shadow-2xl">
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Admin / Review
                      </div>
                      <h1 className="font-headline text-4xl md:text-6xl tracking-tighter leading-[0.95] mt-2">
                        Triage console.
                      </h1>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { key: "pending", label: "Pending" },
                        { key: "approved", label: "Approved" },
                        { key: "rejected", label: "Rejected" },
                        { key: "all", label: "All" },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setStatusFilter(t.key)}
                          className={
                            "px-4 py-3 border font-mono text-[10px] uppercase tracking-widest transition-colors " +
                            (statusFilter === t.key
                              ? "bg-foreground/90 text-background border-foreground/60"
                              : "bg-background/30 text-foreground border-border/50 hover:border-border/80")
                          }
                        >
                          {t.label}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          clearStoredAdminKey();
                          setHasAdminKey(false);
                          setShowKeyModal(true);
                        }}
                        className="font-mono text-[10px] uppercase tracking-widest border border-border/50 px-3 py-2 hover:border-border/80"
                      >
                        Change Key
                      </button>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Results: {rows.length}
                </div>
              </div>

              <div className="border-2 border-border/40 bg-card/40 shadow-2xl overflow-hidden min-h-0 flex-1 flex flex-col">
                <div className="h-2 bg-border/60" />
                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="w-full text-left table-fixed">
                    <colgroup>
                      <col className="w-[38%]" />
                      <col className="w-[36%]" />
                      <col className="w-[14%]" />
                      <col className="w-[12%]" />
                    </colgroup>
                    <thead className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/30">
                      <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <th className="px-5 py-4">Name</th>
                        <th className="px-5 py-4">Craft / Obsession</th>
                        <th className="px-5 py-4">Submitted</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length ? (
                        rows.map((a) => {
                          const name = getNameDisplay(a.name, 3, 30);
                          return (
                            <tr
                              key={a.id}
                              onClick={() => setSelectedId(a.id)}
                              className={
                                "border-b border-border/20 cursor-pointer transition-colors " +
                                (a.id === selectedId
                                  ? "bg-background/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
                                  : "hover:bg-foreground/5")
                              }
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 border border-border/60 bg-background/30 flex items-center justify-center font-headline text-sm text-foreground/90">
                                    {getInitials(a.name)}
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className="font-headline text-lg leading-tight line-clamp-3 whitespace-normal wrap-break-word"
                                      title={name.full}
                                    >
                                      {name.full}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div
                                  className="text-sm text-muted-foreground line-clamp-3 whitespace-normal wrap-break-word"
                                  title={safeTrim(a.craft) || "—"}
                                >
                                  {safeTrim(a.craft) || "—"}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                  {formatDate(a.createdAt)}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={statusChip(a.status)}>
                                  {a.status === "pending"
                                    ? "pending_review"
                                    : a.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-5 py-16">
                            <div className="text-center">
                              {loadStatus === "loading" ? (
                                <>
                                  <div className="font-headline text-2xl mb-2">
                                    Loading…
                                  </div>
                                  <div className="text-muted-foreground font-mono text-xs">
                                    Pulling applicants.
                                  </div>
                                </>
                              ) : loadStatus === "error" ? (
                                <>
                                  <div className="font-headline text-2xl mb-2">
                                    Unable to load.
                                  </div>
                                  <div className="text-muted-foreground font-mono text-xs">
                                    {loadError ||
                                      "Check your admin key + Netlify env."}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-headline text-2xl mb-2">
                                    No matches.
                                  </div>
                                  <div className="text-muted-foreground font-mono text-xs">
                                    Try a different filter.
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Application preview modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Application preview"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={closeModal}
            aria-label="Close preview"
          />
          <div className="absolute inset-0 p-6 md:p-12 pt-24 flex items-start justify-center overflow-hidden">
            <div className="w-full max-w-xl border-2 border-border/40 bg-foreground text-background shadow-2xl overflow-hidden">
              <div className="h-2 bg-background/25" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-background/70">
                      Preview
                    </div>
                    <div className="font-headline text-2xl mt-1">
                      <span className="block whitespace-normal wrap-break-word">
                        {safeTrim(selected.name) || "Unnamed applicant"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className={statusChip(selected.status)}>
                        {selected.status === "pending"
                          ? "pending review"
                          : selected.status}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-background/70">
                        {formatDate(selected.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-background/70 mt-1">
                      {selected.id}
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center justify-center w-9 h-9 border border-background/25 bg-background/5 hover:bg-background/10"
                      aria-label="Close preview"
                      title="Close (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-5 max-h-[70vh] overflow-auto pr-1">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-background/70">
                      Action by
                    </div>
                    <select
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="mt-2 w-full bg-background/10 border border-background/25 px-3 py-2 text-sm text-background focus:outline-none focus:border-background/40"
                    >
                      <option value="" disabled>
                        Select admin
                      </option>
                      <option value="Bhavya Dang">Bhavya Dang</option>
                      <option value="Vijit Chandna">Vijit Chandna</option>
                    </select>
                    {actionError && (
                      <div className="mt-2 text-xs text-destructive">
                        {actionError}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: "Email", value: safeTrim(selected.email) },
                      { label: "Phone", value: safeTrim(selected.phone) },
                      {
                        label: "Hobby / Obsession",
                        value: safeTrim(selected.craft),
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-background/70">
                          {label}
                        </div>
                        <div className="text-sm break-all text-background/80">
                          {value || "—"}
                        </div>
                      </div>
                    ))}
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-background/70">
                        Socials / Portfolio
                      </div>
                      {safeLinkHref(selected.links) ? (
                        <a
                          className="text-sm underline underline-offset-4 hover:opacity-80 break-all"
                          href={safeLinkHref(selected.links)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {String(selected.links)}
                        </a>
                      ) : (
                        <div className="text-sm text-background/60">—</div>
                      )}
                    </div>
                  </div>

                  {selected.status === "pending" && (
                    <div className="pt-6 border-t border-background/20">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          disabled={actionStatus !== "idle"}
                          onClick={() => runAdminAction("approve")}
                          className="inline-flex items-center justify-center gap-2 bg-background/90 text-foreground px-4 py-3 font-headline tracking-tight active:scale-95 transition hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4" />
                          {actionStatus === "approving"
                            ? "Approving…"
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={actionStatus !== "idle"}
                          onClick={() => runAdminAction("reject")}
                          className="inline-flex items-center justify-center gap-2 bg-transparent border border-background/30 px-4 py-3 font-headline tracking-tight active:scale-95 transition hover:border-background/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          {actionStatus === "rejecting"
                            ? "Rejecting…"
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin key modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-full max-w-md border-2 border-border/40 bg-card shadow-2xl">
              <div className="h-2 bg-border/60" />
              <div className="p-6 space-y-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Admin Access
                  </div>
                  <h2 className="font-headline text-3xl mt-1">
                    Enter admin key.
                  </h2>
                </div>
                <input
                  type="password"
                  value={adminKeyDraft}
                  onChange={(e) => setAdminKeyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveKey();
                  }}
                  placeholder="Admin key"
                  className="w-full bg-background/30 border border-border/50 px-3 py-2 text-sm focus:outline-none focus:border-border/80"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="w-full bg-foreground text-background px-4 py-3 font-mono text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-colors hover:cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="w-full bg-foreground text-background px-4 py-3 font-mono text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-colors hover:cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
