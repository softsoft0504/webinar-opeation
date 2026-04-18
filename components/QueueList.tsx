"use client";

import type { QueueEntry } from "@/lib/types";

interface Props {
  entries: QueueEntry[];
  onDelete: (id: string) => void;
}

export default function QueueList({ entries, onDelete }: Props) {
  const waiting = entries.filter((e) => e.status === "waiting");

  if (waiting.length === 0) {
    return (
      <div className="text-center text-[var(--muted)] text-sm py-4">
        대기자가 없습니다. 아래 폼에서 등록하세요.
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {waiting.map((e, i) => (
        <li
          key={e.id}
          className="group flex items-start gap-4 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
        >
          <span className="tabular text-[var(--muted)] text-sm w-6 pt-0.5">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium">{e.name}</div>
            <div className="text-sm text-[var(--muted)] truncate">{e.question}</div>
          </div>
          <button
            onClick={() => {
              if (confirm(`'${e.name}'의 대기 항목을 삭제할까요?`)) onDelete(e.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-xs text-[var(--muted)] hover:text-[var(--warn)] transition px-2 py-1"
          >
            삭제
          </button>
        </li>
      ))}
    </ol>
  );
}
