"use client";

import { createCard } from "@/app/actions/cards";
import {
  CAT_STYLE,
  CATEGORIES,
  SOURCE_TYPES,
} from "@/app/(app)/_lib/constants";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Topic = {
  id: string;
  number: string;
  title: string;
  level: number;
  emoji: string;
};

function detectSourceType(url: string): string {
  if (!url) return "Note";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  return "URL";
}

const ic = {
  x: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-3 h-3"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  share: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  ),
};

export default function ShareClient({
  sharedTitle,
  sharedText,
  sharedUrl,
  topics,
}: {
  sharedTitle: string;
  sharedText: string;
  sharedUrl: string;
  topics: Topic[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: sharedTitle,
    body: sharedText,
    category: "Unprocessed",
    source_type: detectSourceType(sharedUrl),
    source_title: "",
    source_url: sharedUrl,
    scripture: "",
    connected_topic_ids: [] as string[],
  });

  const [topicSearch, setTopicSearch] = useState("");
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [showSource, setShowSource] = useState(!!sharedUrl);

  const filteredTopics = topics.filter((t) =>
    `${t.number} ${t.title}`
      .toLowerCase()
      .includes(topicSearch.toLowerCase())
  );

  const toggleTopic = (id: string) =>
    setForm((f) => ({
      ...f,
      connected_topic_ids: f.connected_topic_ids.includes(id)
        ? f.connected_topic_ids.filter((x) => x !== id)
        : [...f.connected_topic_ids, id],
    }));

  const getLabel = (id: string) => {
    const t = topics.find((x) => x.id === id);
    return t ? `${t.number} ${t.title}` : id;
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await createCard({
        ...form,
        status: form.category === "Unprocessed" ? "Unprocessed" : "Processed",
      });
      if ("success" in result) {
        router.push("/capture");
      }
    });
  };

  const inputClass =
    "w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors bg-white";
  const smallInputClass =
    "w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 bg-white";
  const labelClass =
    "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top banner */}
      <div className="bg-stone-900 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <span className="text-amber-400">{ic.share}</span>
        <span className="text-sm font-semibold text-white">Save to Second Brain</span>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-stone-50">
        {/* Title */}
        <div>
          <label className={labelClass}>Title / Atomic Idea</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="One idea, stated as a claim..."
            className={inputClass}
            autoFocus
          />
        </div>

        {/* Body */}
        <div>
          <label className={labelClass}>Content</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Expand the idea in your own words..."
            rows={4}
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed bg-white"
          />
        </div>

        {/* Source section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Source</label>
            <button
              onClick={() => setShowSource(!showSource)}
              className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold"
            >
              {showSource ? "Hide" : "+ Add Source"}
            </button>
          </div>
          {showSource && (
            <div className="bg-white border border-stone-100 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] text-stone-400 mb-1">
                    Type
                  </label>
                  <select
                    value={form.source_type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source_type: e.target.value }))
                    }
                    className="w-full border border-stone-200 rounded-lg px-2 py-1.5 text-xs text-stone-700 focus:outline-none focus:border-amber-400 bg-white"
                  >
                    {SOURCE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] text-stone-400 mb-1">
                    Title / Author
                  </label>
                  <input
                    value={form.source_title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source_title: e.target.value }))
                    }
                    placeholder="Article or site name..."
                    className={smallInputClass}
                  />
                </div>
              </div>
              {["URL", "Article", "YouTube"].includes(form.source_type) && (
                <div>
                  <label className="block text-[9px] text-stone-400 mb-1">
                    URL
                  </label>
                  <input
                    value={form.source_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, source_url: e.target.value }))
                    }
                    placeholder="https://..."
                    className={`${smallInputClass} font-mono`}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category pills */}
        <div>
          <label className={labelClass}>Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const style = CAT_STYLE[cat];
              const isSelected = form.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  style={
                    isSelected
                      ? {
                          background: style.bg,
                          color: style.text,
                          borderColor: style.border,
                        }
                      : {}
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isSelected
                      ? ""
                      : "border-stone-200 text-stone-500 bg-white hover:bg-stone-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scripture */}
        <div>
          <label className={labelClass}>Scripture</label>
          <input
            value={form.scripture}
            onChange={(e) =>
              setForm((f) => ({ ...f, scripture: e.target.value }))
            }
            placeholder="e.g. Proverbs 27:17"
            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-400 transition-colors bg-white"
          />
        </div>

        {/* Connected Topics */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Connected Topics</label>
            <button
              onClick={() => setShowTopicPicker(!showTopicPicker)}
              className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold"
            >
              {showTopicPicker ? "Done" : "+ Link Topic"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.connected_topic_ids.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] px-2 py-0.5 font-medium"
              >
                {getLabel(id)}
                <button
                  onClick={() => toggleTopic(id)}
                  className="hover:text-red-500"
                >
                  {ic.x}
                </button>
              </span>
            ))}
            {form.connected_topic_ids.length === 0 && (
              <span className="text-[10px] text-stone-300 italic">
                None linked
              </span>
            )}
          </div>

          {showTopicPicker && (
            <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
              <div className="p-2 border-b border-stone-100">
                <input
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full text-xs px-2 py-1 focus:outline-none text-stone-700 placeholder:text-stone-300"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredTopics.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4 italic">
                    No topics found
                  </p>
                ) : (
                  filteredTopics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopic(t.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left border-b border-stone-50 last:border-0"
                    >
                      <div
                        className={`w-3 h-3 rounded border-2 flex-shrink-0 transition-colors ${
                          form.connected_topic_ids.includes(t.id)
                            ? "bg-amber-500 border-amber-500"
                            : "border-stone-300"
                        }`}
                      />
                      <span
                        style={{ paddingLeft: t.level * 12 }}
                        className="text-xs text-stone-600"
                      >
                        <span className="text-stone-400 font-mono text-[10px] mr-1">
                          {t.number}
                        </span>
                        {t.emoji && (
                          <span className="mr-1">{t.emoji}</span>
                        )}
                        {t.title}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="px-4 py-4 border-t border-stone-100 flex gap-3 flex-shrink-0 bg-white">
        <button
          onClick={() => router.push("/capture")}
          disabled={isPending}
          className="flex-1 py-2.5 text-sm text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50 disabled:opacity-40"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={isPending || !form.title.trim()}
          className="flex-[2] py-2.5 text-sm font-bold bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white rounded-xl transition-colors"
        >
          {isPending ? "Saving..." : "Save to Capture"}
        </button>
      </div>
    </div>
  );
}
