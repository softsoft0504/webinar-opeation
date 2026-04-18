"use client";

import type { SessionMode } from "@/lib/types";

interface Props {
  mode: SessionMode;
  hasWaiting: boolean;
  hasCurrent: boolean;
  onStartNext: () => void;
  onEndCurrent: () => void;
  onStartBreak: () => void;
  onResume: () => void;
}

const base =
  "px-5 py-3 rounded-lg font-medium transition disabled:opacity-30 disabled:cursor-not-allowed";
const primary = `${base} bg-white text-black hover:bg-white/90`;
const ghost = `${base} bg-white/10 text-white hover:bg-white/20`;
const danger = `${base} bg-[var(--warn)]/20 text-[var(--warn)] hover:bg-[var(--warn)]/30`;

export default function OperatorControls({
  mode,
  hasWaiting,
  hasCurrent,
  onStartNext,
  onEndCurrent,
  onStartBreak,
  onResume,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {mode === "idle" && (
        <>
          <button onClick={onStartNext} disabled={!hasWaiting} className={primary}>
            첫 번째 대기자 시작
          </button>
          <button onClick={onStartBreak} className={ghost}>
            쉬는 시간
          </button>
        </>
      )}
      {mode === "qa" && (
        <>
          <button onClick={onStartNext} disabled={!hasWaiting} className={primary}>
            다음 →
          </button>
          <button onClick={onStartBreak} className={ghost}>
            쉬는 시간
          </button>
          <button onClick={onEndCurrent} disabled={!hasCurrent} className={danger}>
            현재 종료
          </button>
        </>
      )}
      {mode === "break" && (
        <button onClick={onResume} className={primary}>
          재개하기
        </button>
      )}
    </div>
  );
}
