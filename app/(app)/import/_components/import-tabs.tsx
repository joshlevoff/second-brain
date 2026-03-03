"use client";

import { useState } from "react";
import { ImportClient } from "./import-client";
import { ReadwiseClient } from "./readwise-client";

type Tab = "file" | "readwise";

type Topic = { id: string; number: string; title: string; level: number };

export function ImportTabs({ topics }: { topics: Topic[] }) {
  const [tab, setTab] = useState<Tab>("file");

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex-shrink-0 bg-white border-b border-stone-200 px-5">
        <div className="flex gap-1 -mb-px">
          <button
            onClick={() => setTab("file")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === "file"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            📁 File Upload
          </button>
          <button
            onClick={() => setTab("readwise")}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === "readwise"
                ? "border-stone-900 text-stone-900"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            🔖 Readwise
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === "file" ? (
          <ImportClient topics={topics} />
        ) : (
          <ReadwiseClient topics={topics} />
        )}
      </div>
    </div>
  );
}
