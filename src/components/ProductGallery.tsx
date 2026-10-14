"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  videos,
  name,
}: {
  images: string[];
  videos: string[];
  name: string;
}) {
  const media = [
    ...(images || []).filter(Boolean).map((src) => ({ type: "image" as const, src })),
    ...(videos || []).filter(Boolean).map((src) => ({ type: "video" as const, src })),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  return (
    <div>
      <div className="relative mb-3 aspect-[3/4] overflow-hidden bg-surface">
        {!current ? (
          <div className="absolute inset-0 flex items-center justify-center text-beige-dim font-display">
            D_ALLURE
          </div>
        ) : current.type === "image" ? (
          <Image
            key={current.src}
            src={current.src}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <video src={current.src} controls className="w-full h-full object-cover" />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" aria-label="Product gallery">
          {media.map((m, i) => (
            <button
              key={`${m.type}-${m.src}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${m.type === "image" ? `image ${i + 1}` : `video ${i - images.length + 1}`} of ${name}`}
              aria-pressed={i === active}
              className={`relative h-20 w-16 shrink-0 border bg-surface transition-colors ${
                i === active ? "border-beige" : "border-line hover:border-beige-dim"
              }`}
            >
              {m.type === "image" ? (
                <Image src={m.src} alt="" fill className="object-cover" sizes="64px" />
              ) : (
                <video src={m.src} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
