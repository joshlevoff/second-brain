"use client";

import { completeOnboarding } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Template = "sfn-leader" | "pastor";

const TEMPLATES: Record<
  Template,
  { icon: string; name: string; description: string; topics: { emoji: string; title: string }[] }
> = {
  "sfn-leader": {
    icon: "🎯",
    name: "Christian Leader",
    description:
      "I lead a family, coach others, or run an organization. I want to organize my leadership notes, family principles, and faith insights.",
    topics: [
      { emoji: "🎯", title: "Leadership" },
      { emoji: "🏠", title: "Family" },
      { emoji: "✝️", title: "Faith" },
      { emoji: "💼", title: "Business" },
    ],
  },
  pastor: {
    icon: "✝️",
    name: "Pastor & Teacher",
    description:
      "I prepare sermons, teach regularly, or lead a ministry. I want to organize my study notes, sermon prep, and theological thinking.",
    topics: [
      { emoji: "✝️", title: "Biblical Theology" },
      { emoji: "📖", title: "Expository Texts" },
      { emoji: "🤝", title: "Pastoral Care" },
      { emoji: "⛪", title: "Church Leadership" },
    ],
  },
};

// ─── Progress indicator ───────────────────────────────────────────────────────

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`rounded-full transition-all duration-300 ${
            n === step
              ? "w-6 h-2 bg-amber-400"
              : n < step
              ? "w-2 h-2 bg-stone-800"
              : "w-2 h-2 bg-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Template | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding(selected);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/capture");
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[600px]">
        <ProgressDots step={step} />

        {/* ── Step 1: Welcome ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-6 leading-none">🧠</div>
            <h1
              className="text-3xl font-bold text-stone-900 mb-3"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Welcome to Second Brain
            </h1>
            <p className="text-stone-500 text-base mb-4">
              A thinking partner for everything you know.
            </p>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md mx-auto mb-10">
              Second Brain captures your notes, connects your ideas, and helps
              you create content from what you already know. Let's get you set
              up in two quick steps.
            </p>
            <button
              onClick={() => setStep(2)}
              className="bg-stone-900 hover:bg-stone-700 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
            >
              Let's set it up →
            </button>
          </div>
        )}

        {/* ── Step 2: Template selection ──────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2
              className="text-2xl font-bold text-stone-900 mb-2 text-center"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              How do you want to start?
            </h2>
            <p className="text-stone-400 text-sm text-center mb-8">
              Choose the template that best fits how you think and work.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {(["sfn-leader", "pastor"] as Template[]).map((key) => {
                const t = TEMPLATES[key];
                const isSelected = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                          <polyline
                            points="2 6 5 9 10 3"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="text-3xl mb-3 leading-none">{t.icon}</div>
                    <h3
                      className="font-bold text-stone-900 text-base mb-2"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-stone-500 text-xs leading-relaxed">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selected}
                className="bg-stone-900 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirm & Launch ────────────────────────────────── */}
        {step === 3 && selected && (
          <div>
            <h2
              className="text-2xl font-bold text-stone-900 mb-2 text-center"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Here's your starting structure
            </h2>
            <p className="text-stone-400 text-sm text-center mb-8">
              You're starting with the{" "}
              <span className="font-semibold text-stone-600">
                {TEMPLATES[selected].name}
              </span>{" "}
              template.
            </p>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-5">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                Starting Topics
              </p>
              <div className="space-y-3">
                {TEMPLATES[selected].topics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 font-mono flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-lg leading-none">{topic.emoji}</span>
                    <span className="text-sm font-semibold text-stone-800">
                      {topic.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-stone-400 text-center mb-8 leading-relaxed">
              You can add, rename, or reorganize any of these at any time.
              This is just a starting point.
            </p>

            {error && (
              <p className="text-xs text-red-500 text-center mb-4">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={isPending}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                onClick={handleLaunch}
                disabled={isPending}
                className="bg-stone-900 hover:bg-stone-700 disabled:opacity-50 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
              >
                {isPending ? "Setting up…" : "Open my Second Brain →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
