"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-line p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-beige">{title}</h2>
          <button onClick={onClose} className="text-beige-dim hover:text-beige" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
