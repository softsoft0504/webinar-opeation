"use client";

import { getSupabase } from "./supabase";
import type { Session, QueueEntry } from "./types";

export async function getOrCreateSession(): Promise<Session> {
  const sb = getSupabase();
  const { data: existing, error: readErr } = await sb
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (readErr) throw readErr;
  if (existing) return existing as Session;

  const { data: created, error: createErr } = await sb
    .from("sessions")
    .insert({ mode: "idle" })
    .select("*")
    .single();
  if (createErr) throw createErr;
  return created as Session;
}

export async function fetchEntries(sessionId: string): Promise<QueueEntry[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("queue_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as QueueEntry[];
}

export async function addEntry(
  sessionId: string,
  name: string,
  question: string
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("queue_entries").insert({
    session_id: sessionId,
    name,
    question,
    status: "waiting",
  });
  if (error) throw error;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("queue_entries").delete().eq("id", entryId);
  if (error) throw error;
}

export async function startNext(session: Session, entries: QueueEntry[]): Promise<void> {
  const sb = getSupabase();
  const now = new Date().toISOString();

  if (session.current_entry_id) {
    await sb
      .from("queue_entries")
      .update({ status: "done", ended_at: now })
      .eq("id", session.current_entry_id);
  }

  const next = entries.find(
    (e) => e.status === "waiting" && e.id !== session.current_entry_id
  );

  if (!next) {
    await sb
      .from("sessions")
      .update({
        mode: "idle",
        current_entry_id: null,
        timer_started_at: null,
      })
      .eq("id", session.id);
    return;
  }

  await sb
    .from("queue_entries")
    .update({ status: "current", started_at: now })
    .eq("id", next.id);

  await sb
    .from("sessions")
    .update({
      mode: "qa",
      current_entry_id: next.id,
      timer_started_at: now,
    })
    .eq("id", session.id);
}

export async function endCurrent(session: Session): Promise<void> {
  const sb = getSupabase();
  const now = new Date().toISOString();

  if (session.current_entry_id) {
    await sb
      .from("queue_entries")
      .update({ status: "done", ended_at: now })
      .eq("id", session.current_entry_id);
  }

  await sb
    .from("sessions")
    .update({
      mode: "idle",
      current_entry_id: null,
      timer_started_at: null,
    })
    .eq("id", session.id);
}

export async function startBreak(session: Session): Promise<void> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  await sb
    .from("sessions")
    .update({
      mode: "break",
      timer_started_at: now,
    })
    .eq("id", session.id);
}

export async function resumeFromBreak(session: Session): Promise<void> {
  const sb = getSupabase();
  const mode = session.current_entry_id ? "qa" : "idle";
  const now = session.current_entry_id ? new Date().toISOString() : null;
  await sb
    .from("sessions")
    .update({
      mode,
      timer_started_at: now,
    })
    .eq("id", session.id);
}

export async function updateTimerDuration(
  session: Session,
  field: "timer_duration_sec" | "break_duration_sec",
  value: number
): Promise<void> {
  const sb = getSupabase();
  await sb
    .from("sessions")
    .update({ [field]: value })
    .eq("id", session.id);
}
