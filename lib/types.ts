export type SessionMode = "idle" | "qa" | "break";

export type EntryStatus = "waiting" | "current" | "done" | "skipped";

export interface Session {
  id: string;
  created_at: string;
  mode: SessionMode;
  current_entry_id: string | null;
  timer_started_at: string | null;
  timer_duration_sec: number;
  break_duration_sec: number;
}

export interface QueueEntry {
  id: string;
  session_id: string;
  name: string;
  question: string;
  status: EntryStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}
