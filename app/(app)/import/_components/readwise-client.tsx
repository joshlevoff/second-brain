"use client";

import { createCard } from "@/app/actions/cards";
import { fetchReadwiseHighlights, type ReadwiseHighlight } from "@/app/actions/readwise";
import { CATEGORIES } from "@/app/(app)/_lib/constants";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReadwiseState = "connect" | "ready" | "triage" | "complete";

type Topic = { id: string; number: string; title: string; level: number };

type HighlightCard = {
  title: string;
  body: string;
  category: string;
  scripture: string;
  connected_topic_ids: string[];
  source_title: string;
  source_url: string;
};

const IMPORT_CATS = CATEGORIES.filter((c) => c !== "Unprocessed");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

function highlightToCard(h: ReadwiseHighlight): HighlightCard {
  return {
    title: truncateAtWord(h.text, 80),
    body: h.text + (h.note ? `\n\n📝 ${h.note}` : ""),
    category: "Studies",
    scripture: "",
    connected_topic_ids: [],
    source_title: h.book_title,
    source_url: h.url ?? "",
  };
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Topic picker ─────────────────────────────────────────────────────────────

function TopicPicker({
  topics,
  selected,
  onChange,
}: {
  topics: Topic[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = topics.filter((t) =>
    `${t.number} ${t.title}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );

  const getLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : id;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[22px]">
        {selected.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] px-2 py-0.5 font-medium"
          >
            {getLabel(id)}
            <button
              onClick={() => toggle(id)}
              className="hover:text-red-500 leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        {selected.length === 0 && (
          <span className="text-[10px] text-stone-300 italic">None linked</span>
        )}
      </div>
      <div className="relative">
        <input
          value={search}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search topics to link..."
          className="w-full border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400"
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-10 top-full mt-1 left-0 right-0 border border-stone-200 rounded-xl bg-white shadow-md overflow-hidden max-h-44 overflow-y-auto">
            {filtered.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onMouseDown={() => {
                  toggle(t.id);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left border-b border-stone-50 last:border-0"
              >
                <div
                  className={`w-3 h-3 rounded border-2 flex-shrink-0 ${
                    selected.includes(t.id)
                      ? "bg-amber-500 border-amber-500"
                      : "border-stone-300"
                  }`}
                />
                <span className="text-xs text-stone-600">
                  <span className="text-stone-400 font-mono text-[10px] mr-1">
                    {t.number}
                  </span>
                  {t.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({
  subtitle,
  right,
}: {
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex-shrink-0 border-b border-stone-200 bg-white px-5 py-3 flex items-center justify-between">
      <div>
        <h1
          className="font-bold text-stone-900"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          🔖 Readwise
        </h1>
        <p className="text-xs text-stone-400">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReadwiseClient({ topics }: { topics: Topic[] }) {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [rwState, setRwState] = useState<ReadwiseState>("connect");
  const [cards, setCards] = useState<HighlightCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editFields, setEditFields] = useState<HighlightCard | null>(null);
  const [approved, setApproved] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [isSaving, startSaveTransition] = useTransition();
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load stored key + last sync on mount
  useEffect(() => {
    const key = localStorage.getItem("readwise_api_key");
    const sync = localStorage.getItem("readwise_last_sync");
    if (key) {
      setSavedKey(key);
      setApiKey(key);
      setRwState("ready");
    }
    if (sync) setLastSync(sync);
  }, []);

  const handleSaveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    localStorage.setItem("readwise_api_key", trimmed);
    setSavedKey(trimmed);
    setSyncError(null);
    setRwState("ready");
  };

  const handleSync = async () => {
    if (!savedKey) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await fetchReadwiseHighlights(
        savedKey,
        lastSync ?? undefined
      );
      if (result.error) {
        setSyncError(result.error);
        return;
      }
      if (result.highlights.length === 0) {
        setSyncError("No new highlights since last sync.");
        return;
      }
      const newCards = result.highlights.map(highlightToCard);
      setCards(newCards);
      setCurrentIndex(0);
      setEditFields({ ...newCards[0] });
      setApproved(0);
      setSkipped(0);
      setRwState("triage");
      const now = new Date().toISOString();
      localStorage.setItem("readwise_last_sync", now);
      setLastSync(now);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("readwise_api_key");
    localStorage.removeItem("readwise_last_sync");
    setSavedKey(null);
    setApiKey("");
    setLastSync(null);
    setSyncError(null);
    setRwState("connect");
  };

  const advance = (nextIndex: number) => {
    if (nextIndex >= cards.length) {
      setRwState("complete");
    } else {
      setCurrentIndex(nextIndex);
      setEditFields({ ...cards[nextIndex] });
    }
  };

  const handleApprove = () => {
    if (!editFields) return;
    const next = currentIndex + 1;
    startSaveTransition(async () => {
      await createCard({
        title: editFields.title,
        body: editFields.body,
        category: editFields.category,
        status: "Processed",
        source_type: "Book",
        source_title: editFields.source_title,
        source_url: editFields.source_url,
        scripture: editFields.scripture,
        connected_topic_ids: editFields.connected_topic_ids,
      });
      setApproved((a) => a + 1);
      advance(next);
    });
  };

  const handleSkip = () => {
    setSkipped((s) => s + 1);
    advance(currentIndex + 1);
  };

  const handleAcceptAll = async () => {
    const remaining = cards.slice(currentIndex);
    setIsBulkSaving(true);
    await Promise.all(
      remaining.map((card) =>
        createCard({
          title: card.title,
          body: card.body,
          category: card.category,
          status: "Processed",
          source_type: "Book",
          source_title: card.source_title,
          source_url: card.source_url,
          scripture: card.scripture,
          connected_topic_ids: card.connected_topic_ids,
        })
      )
    );
    setApproved((a) => a + remaining.length);
    setIsBulkSaving(false);
    setRwState("complete");
  };

  const resetToReady = () => {
    setCards([]);
    setCurrentIndex(0);
    setEditFields(null);
    setApproved(0);
    setSkipped(0);
    setSyncError(null);
    setRwState("ready");
  };

  const progress =
    cards.length > 0 ? ((approved + skipped) / cards.length) * 100 : 0;

  // ── Connect ───────────────────────────────────────────────────────────────
  if (rwState === "connect") {
    return (
      <div className="flex flex-col h-full">
        <PageHeader subtitle="Connect your Readwise account to import highlights" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔖</span>
                </div>
                <h2
                  className="text-lg font-bold text-stone-900 mb-1"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Connect Readwise
                </h2>
                <p className="text-sm text-stone-500">
                  Paste your Readwise Access Token to sync highlights into your
                  library.
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                  placeholder="Paste your Readwise token..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim()}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-40 transition-colors"
                >
                  Connect
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-stone-400">
                Find your token at{" "}
                <span className="font-mono text-stone-500">
                  readwise.io/access_token
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready (connected, not syncing) ────────────────────────────────────────
  if (rwState === "ready") {
    return (
      <div className="flex flex-col h-full">
        <PageHeader subtitle="Sync highlights from your Readwise account" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-7 h-7 text-green-500"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2
                  className="text-lg font-bold text-stone-900 mb-1"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Readwise Connected
                </h2>
                <p className="text-sm text-stone-500">
                  {lastSync
                    ? `Last synced ${relativeDate(lastSync)}`
                    : "Never synced — import all your highlights"}
                </p>
              </div>

              {syncError && (
                <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
                  {syncError}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Syncing…
                    </>
                  ) : lastSync ? (
                    "Sync New Highlights"
                  ) : (
                    "Import All Highlights"
                  )}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 rounded-xl border border-stone-200 text-stone-500 text-xs hover:bg-stone-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Triage ────────────────────────────────────────────────────────────────
  if (rwState === "triage" && editFields) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          subtitle={`${approved + skipped} of ${cards.length} reviewed · ${approved} added · ${skipped} skipped`}
          right={
            <button
              onClick={resetToReady}
              className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              Stop
            </button>
          }
        />

        {/* Progress bar */}
        <div className="h-1 bg-stone-100 flex-shrink-0">
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Triage card */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <p className="text-[11px] text-stone-400 text-center mb-5 font-mono tracking-wide">
              Highlight {currentIndex + 1} of {cards.length}
            </p>

            <div
              key={currentIndex}
              className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4"
            >
              {/* Source */}
              {editFields.source_title && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    From
                  </span>
                  <span className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded px-2 py-0.5 font-medium truncate">
                    {editFields.source_title}
                  </span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                  Title / Atomic Idea
                </label>
                <input
                  value={editFields.title}
                  onChange={(e) =>
                    setEditFields({ ...editFields, title: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                  Content
                </label>
                <textarea
                  value={editFields.body}
                  onChange={(e) =>
                    setEditFields({ ...editFields, body: e.target.value })
                  }
                  rows={5}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Category + Scripture */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Category
                  </label>
                  <select
                    value={editFields.category}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition-colors bg-white"
                  >
                    {IMPORT_CATS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                    Scripture
                  </label>
                  <input
                    value={editFields.scripture}
                    onChange={(e) =>
                      setEditFields({
                        ...editFields,
                        scripture: e.target.value,
                      })
                    }
                    placeholder="e.g. Proverbs 27:17"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-amber-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                  Connected Topics
                </label>
                <TopicPicker
                  topics={topics}
                  selected={editFields.connected_topic_ids}
                  onChange={(ids) =>
                    setEditFields({ ...editFields, connected_topic_ids: ids })
                  }
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSkip}
                disabled={isSaving || isBulkSaving}
                className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 text-sm font-semibold hover:bg-stone-200 disabled:opacity-40 transition-colors"
              >
                Skip →
              </button>
              <button
                onClick={handleApprove}
                disabled={isSaving || isBulkSaving || !editFields.title.trim()}
                className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-40 transition-colors"
              >
                {isSaving ? "Saving…" : "Add to Library ✓"}
              </button>
            </div>
            {cards.length - currentIndex > 1 && (
              <button
                onClick={handleAcceptAll}
                disabled={isSaving || isBulkSaving}
                className="w-full mt-2 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-xs font-semibold hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                {isBulkSaving
                  ? "Saving…"
                  : `Accept all ${cards.length - currentIndex} remaining →`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <PageHeader subtitle="Sync highlights from your Readwise account" />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7 text-green-500"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            className="text-xl font-bold text-stone-900 mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Sync complete
          </h2>
          <p className="text-sm text-stone-600 mb-1">
            <span className="font-semibold text-stone-900">{approved}</span>{" "}
            card{approved !== 1 ? "s" : ""} added to your Library
          </p>
          <p className="text-xs text-stone-400 mb-8">
            {skipped} highlight{skipped !== 1 ? "s" : ""} skipped
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetToReady}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Sync again
            </button>
            <Link
              href="/library"
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 transition-colors"
            >
              Go to Library →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
