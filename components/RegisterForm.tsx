"use client";

import { useState } from "react";

interface Props {
  onSubmit: (name: string, question: string) => Promise<void>;
}

export default function RegisterForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !question.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), question.trim());
      setName("");
      setQuestion("");
      setFlash("등록 완료!");
      setTimeout(() => setFlash(null), 1800);
    } catch (err) {
      setFlash(`오류: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handle}
      className="space-y-3 p-6 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="text-sm text-[var(--muted)]">
        줄 서기 — 이름과 질문을 입력하면 대기열 맨 뒤에 추가됩니다
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          maxLength={40}
          required
          className="px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
        />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문을 한 줄로 적어주세요"
          maxLength={300}
          required
          className="px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 transition"
        >
          {submitting ? "..." : "줄 서기"}
        </button>
      </div>
      {flash && (
        <div className="text-sm text-[var(--muted)]">{flash}</div>
      )}
    </form>
  );
}
