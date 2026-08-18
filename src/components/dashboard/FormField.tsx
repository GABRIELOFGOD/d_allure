"use client";

import { ReactNode } from "react";

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim";
