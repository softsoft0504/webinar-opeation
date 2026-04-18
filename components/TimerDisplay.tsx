"use client";

import { useEffect, useState } from "react";

interface Props {
  startedAt: string | null;
  durationSec: number;
  size?: "lg" | "xl";
}

export default function TimerDisplay({ startedAt, durationSec, size = "xl" }: Props) {
  const [remaining, setRemaining] = useState(durationSec);

  useEffect(() => {
    if (!startedAt) {
      setRemaining(durationSec);
      return;
    }
    const start = new Date(startedAt).getTime();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setRemaining(durationSec - elapsed);
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [startedAt, durationSec]);

  const overdue = remaining < 0;
  const abs = Math.abs(remaining);
  const mm = String(Math.floor(abs / 60)).padStart(2, "0");
  const ss = String(abs % 60).padStart(2, "0");

  const sizeClass = size === "xl" ? "text-[12rem] md:text-[16rem] leading-none" : "text-7xl md:text-8xl leading-none";

  return (
    <div
      className={`tabular font-semibold ${sizeClass} ${
        overdue ? "text-[var(--warn)]" : "text-[var(--fg)]"
      } tracking-tight`}
    >
      {overdue ? "-" : ""}
      {mm}:{ss}
    </div>
  );
}
