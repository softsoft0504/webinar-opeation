"use client";

import type { QueueEntry } from "@/lib/types";

interface Props {
  entry: QueueEntry | null;
}

export default function CurrentSpeaker({ entry }: Props) {
  if (!entry) {
    return (
      <div className="text-center text-[var(--muted)] text-2xl md:text-3xl">
        다음 순서를 기다리는 중
      </div>
    );
  }
  return (
    <div className="text-center space-y-4">
      <div className="text-4xl md:text-6xl font-semibold tracking-tight">
        {entry.name}
      </div>
      <div className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl mx-auto whitespace-pre-wrap">
        {entry.question}
      </div>
    </div>
  );
}
