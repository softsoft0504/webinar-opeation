"use client";

import type { Session, QueueEntry } from "./types";

let mockSession: Session = {
  id: "mock-session",
  created_at: new Date().toISOString(),
  mode: "qa",
  current_entry_id: "mock-entry-1",
  timer_started_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  timer_duration_sec: 600,
  break_duration_sec: 600,
};

let mockEntries: QueueEntry[] = [
  {
    id: "mock-entry-1",
    session_id: "mock-session",
    name: "이지은",
    question: "AI 에이전트로 우리 팀 온보딩 문서를 어떻게 자동 정리하면 좋을까요?",
    status: "current",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    started_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    ended_at: null,
  },
  {
    id: "mock-entry-2",
    session_id: "mock-session",
    name: "박민수",
    question: "Claude Code 훅으로 커밋 메시지 자동 생성 어디서부터 시작해요?",
    status: "waiting",
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    started_at: null,
    ended_at: null,
  },
  {
    id: "mock-entry-3",
    session_id: "mock-session",
    name: "Jay",
    question: "MCP 서버 직접 만들어 보려고 하는데 보안 체크리스트가 궁금해요",
    status: "waiting",
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    started_at: null,
    ended_at: null,
  },
  {
    id: "mock-entry-4",
    session_id: "mock-session",
    name: "강지훈",
    question: "팀원들이 에이전트 워크플로우에 회의감을 보이는데 어떻게 설득했나요?",
    status: "waiting",
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    started_at: null,
    ended_at: null,
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}
export function subscribeMock(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function mockGetSession(): Session {
  return { ...mockSession };
}

export function mockGetEntries(): QueueEntry[] {
  return mockEntries.map((e) => ({ ...e }));
}

export function mockAddEntry(name: string, question: string) {
  mockEntries.push({
    id: `mock-${Date.now()}`,
    session_id: "mock-session",
    name,
    question,
    status: "waiting",
    created_at: new Date().toISOString(),
    started_at: null,
    ended_at: null,
  });
  notify();
}

export function mockDeleteEntry(id: string) {
  mockEntries = mockEntries.filter((e) => e.id !== id);
  notify();
}

export function mockStartNext() {
  const now = new Date().toISOString();
  if (mockSession.current_entry_id) {
    mockEntries = mockEntries.map((e) =>
      e.id === mockSession.current_entry_id
        ? { ...e, status: "done", ended_at: now }
        : e
    );
  }
  const next = mockEntries.find(
    (e) => e.status === "waiting" && e.id !== mockSession.current_entry_id
  );
  if (!next) {
    mockSession = {
      ...mockSession,
      mode: "idle",
      current_entry_id: null,
      timer_started_at: null,
    };
  } else {
    mockEntries = mockEntries.map((e) =>
      e.id === next.id ? { ...e, status: "current", started_at: now } : e
    );
    mockSession = {
      ...mockSession,
      mode: "qa",
      current_entry_id: next.id,
      timer_started_at: now,
    };
  }
  notify();
}

export function mockEndCurrent() {
  const now = new Date().toISOString();
  if (mockSession.current_entry_id) {
    mockEntries = mockEntries.map((e) =>
      e.id === mockSession.current_entry_id
        ? { ...e, status: "done", ended_at: now }
        : e
    );
  }
  mockSession = {
    ...mockSession,
    mode: "idle",
    current_entry_id: null,
    timer_started_at: null,
  };
  notify();
}

export function mockStartBreak() {
  mockSession = {
    ...mockSession,
    mode: "break",
    timer_started_at: new Date().toISOString(),
  };
  notify();
}

export function mockResume() {
  const hasCurrent = !!mockSession.current_entry_id;
  mockSession = {
    ...mockSession,
    mode: hasCurrent ? "qa" : "idle",
    timer_started_at: hasCurrent ? new Date().toISOString() : null,
  };
  notify();
}
