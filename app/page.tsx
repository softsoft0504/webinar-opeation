"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  getOrCreateSession,
  fetchEntries,
  addEntry,
  deleteEntry,
  startNext,
  endCurrent,
  startBreak,
  resumeFromBreak,
} from "@/lib/session";
import {
  subscribeMock,
  mockGetSession,
  mockGetEntries,
  mockAddEntry,
  mockDeleteEntry,
  mockStartNext,
  mockEndCurrent,
  mockStartBreak,
  mockResume,
} from "@/lib/mock";
import type { Session, QueueEntry } from "@/lib/types";
import TimerDisplay from "@/components/TimerDisplay";
import CurrentSpeaker from "@/components/CurrentSpeaker";
import QueueList from "@/components/QueueList";
import RegisterForm from "@/components/RegisterForm";
import BreakMode from "@/components/BreakMode";
import OperatorControls from "@/components/OperatorControls";

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<boolean | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isDemo = !url || !key;
    setDemoMode(isDemo);

    if (isDemo) {
      setSession(mockGetSession());
      setEntries(mockGetEntries());
      const unsub = subscribeMock(() => {
        setSession(mockGetSession());
        setEntries(mockGetEntries());
      });
      return () => {
        unsub();
      };
    }

    let mounted = true;

    (async () => {
      try {
        const s = await getOrCreateSession();
        if (!mounted) return;
        setSession(s);
        const list = await fetchEntries(s.id);
        if (!mounted) return;
        setEntries(list);
      } catch (e) {
        if (mounted) setError((e as Error).message);
      }
    })();

    const sb = getSupabase();
    const channel = sb
      .channel("workshop")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          const row = payload.new as Session;
          setSession((prev) => (prev && prev.id !== row.id ? prev : row));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries" },
        async () => {
          const cur = await getOrCreateSession();
          const list = await fetchEntries(cur.id);
          setEntries(list);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, []);

  const currentEntry = useMemo(() => {
    if (!session?.current_entry_id) return null;
    return entries.find((e) => e.id === session.current_entry_id) ?? null;
  }, [entries, session]);

  const hasWaiting = entries.some(
    (e) => e.status === "waiting" && e.id !== session?.current_entry_id
  );

  async function refresh() {
    try {
      const s = await getOrCreateSession();
      const list = await fetchEntries(s.id);
      setSession(s);
      setEntries(list);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function runReal<T>(fn: () => Promise<T>) {
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const handlers = demoMode
    ? {
        next: () => mockStartNext(),
        end: () => mockEndCurrent(),
        break_: () => mockStartBreak(),
        resume: () => mockResume(),
        add: async (name: string, question: string) =>
          mockAddEntry(name, question),
        del: (id: string) => mockDeleteEntry(id),
      }
    : {
        next: () => session && runReal(() => startNext(session, entries)),
        end: () => session && runReal(() => endCurrent(session)),
        break_: () => session && runReal(() => startBreak(session)),
        resume: () => session && runReal(() => resumeFromBreak(session)),
        add: async (name: string, question: string) => {
          if (!session) return;
          await addEntry(session.id, name, question);
          await refresh();
        },
        del: (id: string) => runReal(() => deleteEntry(id)),
      };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-semibold text-[var(--warn)]">오류</h1>
          <pre className="bg-black/60 p-4 rounded-lg text-sm overflow-x-auto border border-white/10">
            {error}
          </pre>
          <p className="text-sm text-[var(--muted)]">
            Supabase 테이블이 생성되었는지, RLS 정책이 공개 접근을 허용하는지 확인하세요.
          </p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">로딩 중...</div>
      </main>
    );
  }

  const isBreak = session.mode === "break";

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 md:py-16 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-12">
        <div className="text-sm text-[var(--muted)] tracking-wider uppercase">
          Workshop Q&amp;A
        </div>
        <div className="flex items-center gap-3">
          {demoMode && (
            <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded bg-white/10 text-[var(--muted)]">
              Demo mode
            </span>
          )}
          <div className="text-sm text-[var(--muted)] tabular">
            {entries.filter((e) => e.status === "waiting").length}명 대기 중
          </div>
        </div>
      </header>

      <section className="flex flex-col items-center text-center mb-16">
        <TimerDisplay
          startedAt={session.mode === "qa" ? session.timer_started_at : null}
          durationSec={session.timer_duration_sec}
          size="xl"
        />
        <div className="mt-4 text-sm text-[var(--muted)]">
          {session.mode === "qa" ? "진행 중" : "대기 중"}
        </div>
      </section>

      <section className="mb-16 min-h-[180px] flex items-center justify-center">
        <CurrentSpeaker entry={currentEntry} />
      </section>

      <section className="mb-12">
        <OperatorControls
          mode={session.mode}
          hasWaiting={hasWaiting}
          hasCurrent={!!currentEntry}
          onStartNext={handlers.next}
          onEndCurrent={handlers.end}
          onStartBreak={handlers.break_}
          onResume={handlers.resume}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-sm uppercase tracking-wider text-[var(--muted)] mb-4">
          대기열
        </h2>
        <QueueList entries={entries} onDelete={handlers.del} />
      </section>

      <section>
        <RegisterForm onSubmit={handlers.add} />
      </section>

      {isBreak && (
        <BreakMode
          startedAt={session.timer_started_at}
          durationSec={session.break_duration_sec}
          onResume={handlers.resume}
        />
      )}
    </main>
  );
}
