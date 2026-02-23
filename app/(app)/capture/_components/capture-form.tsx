"use client";

import { createCard } from "@/app/actions/cards";
import { useState, useTransition } from "react";

const CATEGORIES = [
  "Unprocessed",
  "Studies",
  "Rules",
  "Articles",
  "Courses",
  "Literature I Love",
];

const SOURCE_TYPES = [
  "Book",
  "Article",
  "Podcast",
  "YouTube",
  "URL",
  "Note",
  "Course",
  "Other",
];

const emptyForm = {
  title: "",
  body: "",
  category: "Unprocessed",
  source_type: "Note",
  source_title: "",
};

export default function CaptureForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCard(form);
      if ("error" in result) {
        setError(result.error);
      } else {
        setForm(emptyForm);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h2 className="mb-5 text-base font-semibold text-zinc-50">
        New card
      </h2>

      <div className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="What's this about?"
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Body <span className="text-red-500">*</span>
          </label>
          <textarea
            name="body"
            required
            rows={4}
            value={form.body}
            onChange={handleChange}
            placeholder="Write your note, idea, or insight…"
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Category + Source Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Source type
            </label>
            <select
              name="source_type"
              value={form.source_type}
              onChange={handleChange}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Source title */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Source title{" "}
            <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="text"
            name="source_title"
            value={form.source_title}
            onChange={handleChange}
            placeholder="e.g. Atomic Habits, Lex Fridman #400…"
            disabled={isPending}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="self-end rounded-lg bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save card"}
        </button>
      </div>
    </form>
  );
}
