"use client";

import TimerDisplay from "./TimerDisplay";

interface Props {
  startedAt: string | null;
  durationSec: number;
  onResume: () => void;
}

export default function BreakMode({ startedAt, durationSec, onResume }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-2xl md:text-3xl text-[var(--muted)] mb-4">잠시 쉬는 시간</div>
      <div className="mb-10">
        <TimerDisplay startedAt={startedAt} durationSec={durationSec} size="xl" />
      </div>
      <button
        onClick={onResume}
        className="px-8 py-4 rounded-xl bg-white text-black text-lg font-medium hover:bg-white/90 transition"
      >
        재개하기
      </button>
    </div>
  );
}
