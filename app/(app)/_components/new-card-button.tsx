"use client";

import { CardModal } from "@/app/(app)/_components/card-modal";
import { getTopics } from "@/app/actions/topics";
import { useState, useTransition } from "react";

type Topic = { id: string; number: string; title: string; level: number };

export function NewCardButton() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const t = await getTopics();
      setTopics(t as Topic[]);
      setOpen(true);
    });
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        + New Card
      </button>
      {open && (
        <CardModal
          card={null}
          topics={topics}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
