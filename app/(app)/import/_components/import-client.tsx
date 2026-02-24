"use client";

import { createCard } from "@/app/actions/cards";
import { CATEGORIES } from "@/app/(app)/_lib/constants";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImportState = "upload" | "triage" | "complete";

type Topic = { id: string; number: string; title: string; level: number };

type ChunkCard = {
  title: string;
  body: string;
  category: string;
  scripture: string;
  connected_topic_ids: string[];
};

const IMPORT_CATS = CATEGORIES.filter((c) => c !== "Unprocessed");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
}

function chunkText(text: string): { chunks: ChunkCard[]; totalFound: number } {
  const candidates = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 20);
  const totalFound = candidates.length;
  const chunks = candidates.slice(0, 500).map((p) => ({
    title: truncateAtWord(p, 80),
    body: p,
    category: "Studies",
    scripture: "",
    connected_topic_ids: [] as string[],
  }));
  return { chunks, totalFound };
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
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
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

// ─── Upload icon ──────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-12 h-12 text-stone-300"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ─── Page header (shared) ─────────────────────────────────────────────────────

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
          📤 Import
        </h1>
        <p className="text-xs text-stone-400">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ImportClient({ topics }: { topics: Topic[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>("upload");
  const [filename, setFilename] = useState("");
  const [chunks, setChunks] = useState<ChunkCard[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editFields, setEditFields] = useState<ChunkCard | null>(null);
  const [approved, setApproved] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [isSaving, startTransition] = useTransition();
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const processFile = async (file: File) => {
    setFileError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["txt", "md", "docx"].includes(ext ?? "")) {
      setFileError("Unsupported file type. Please upload .txt, .md, or .docx");
      return;
    }

    setIsReading(true);
    try {
      let text = "";
      if (ext === "txt" || ext === "md") {
        text = await file.text();
      } else {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }

      const { chunks: newChunks, totalFound: found } = chunkText(text);

      if (newChunks.length === 0) {
        setFileError(
          "No content found. Make sure the file has paragraphs separated by blank lines."
        );
        return;
      }

      setFilename(file.name);
      setChunks(newChunks);
      setTotalFound(found);
      setCurrentIndex(0);
      setEditFields({ ...newChunks[0] });
      setApproved(0);
      setSkipped(0);
      setImportState("triage");
    } catch {
      setFileError("Failed to read file. Please try again.");
    } finally {
      setIsReading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const advance = (nextIndex: number) => {
    if (nextIndex >= chunks.length) {
      setImportState("complete");
    } else {
      setCurrentIndex(nextIndex);
      setEditFields({ ...chunks[nextIndex] });
    }
  };

  const handleApprove = () => {
    if (!editFields) return;
    const sourceName = filename.replace(/\.[^.]+$/, "");
    const next = currentIndex + 1;
    startTransition(async () => {
      await createCard({
        title: editFields.title,
        body: editFields.body,
        category: editFields.category,
        status: "Processed",
        source_type: "Note",
        source_title: sourceName,
        source_url: "",
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

  const reset = () => {
    setImportState("upload");
    setChunks([]);
    setFilename("");
    setTotalFound(0);
    setCurrentIndex(0);
    setEditFields(null);
    setApproved(0);
    setSkipped(0);
    setFileError(null);
  };

  const progress =
    chunks.length > 0 ? ((approved + skipped) / chunks.length) * 100 : 0;

  // ── Upload ─────────────────────────────────────────────────────────────────
  if (importState === "upload") {
    return (
      <div className="flex flex-col h-full">
        <PageHeader subtitle="Upload files to triage into your library" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            <div
              className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-amber-400 bg-amber-50"
                  : "border-stone-200 hover:border-amber-300 hover:bg-stone-50/60"
              } ${isReading ? "opacity-50 pointer-events-none" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx"
                className="hidden"
                onChange={handleFileInput}
              />
              <UploadIcon />
              <h2 className="text-base font-semibold text-stone-700 mt-4 mb-1">
                {isReading ? "Reading file…" : "Drop files here"}
              </h2>
              <p className="text-sm text-stone-400 mb-5">
                {isReading ? "Parsing content" : "or click to browse"}
              </p>
              <p className="text-[11px] text-stone-300 font-mono tracking-wider">
                .txt · .md · .docx
              </p>
            </div>
            {fileError && (
              <p className="mt-4 text-xs text-red-500 text-center bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {fileError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Triage ─────────────────────────────────────────────────────────────────
  if (importState === "triage" && editFields) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <PageHeader
          subtitle={`${approved + skipped} of ${chunks.length} reviewed · ${approved} added · ${skipped} skipped`}
          right={
            <button
              onClick={reset}
              className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              Start Over
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

        {/* Truncation notice */}
        {totalFound > 500 && (
          <div className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-5 py-2 text-center">
            <p className="text-[11px] text-amber-700">
              File had {totalFound} paragraphs — showing the first 500. Import
              the rest in a second batch.
            </p>
          </div>
        )}

        {/* Triage card */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <p className="text-[11px] text-stone-400 text-center mb-5 font-mono tracking-wide">
              Card {currentIndex + 1} of {chunks.length}
            </p>

            <div
              key={currentIndex}
              className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 space-y-4"
            >
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
                      setEditFields({ ...editFields, category: e.target.value })
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
                      setEditFields({ ...editFields, scripture: e.target.value })
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
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 text-sm font-semibold hover:bg-stone-200 disabled:opacity-40 transition-colors"
              >
                Skip →
              </button>
              <button
                onClick={handleApprove}
                disabled={isSaving || !editFields.title.trim()}
                className="flex-1 py-3 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-700 disabled:opacity-40 transition-colors"
              >
                {isSaving ? "Saving…" : "Add to Library ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <PageHeader subtitle="Upload files to triage into your library" />
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
            Import complete
          </h2>
          <p className="text-sm text-stone-600 mb-1">
            <span className="font-semibold text-stone-900">{approved}</span>{" "}
            card{approved !== 1 ? "s" : ""} added to your Library
          </p>
          <p className="text-xs text-stone-400 mb-8">
            {skipped} card{skipped !== 1 ? "s" : ""} skipped
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Import another file
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
