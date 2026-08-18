"use client";

import { useEffect, useState } from "react";
import FastMarquee from "react-fast-marquee";
import type { Announcement } from "@/types";

export default function Marquee() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!announcements.length) return null;

  const text = announcements.map((a) => a.text).join("   //   ");

  return (
    <div className="w-full bg-burgundy border-b border-line">
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-beige" />
        </span>
        <FastMarquee speed={50} gradient={false} className="w-full">
          <span className="font-mono text-xs tracking-widest-plus text-beige whitespace-nowrap pr-16 uppercase">
            {text}
          </span>
        </FastMarquee>
      </div>
    </div>
  );
}
