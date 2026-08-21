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
  const media = [...images.map((src) => ({ type: "image" as const, src })), ...videos.map((src) => ({ type: "video" as const, src }))];
  const [active, setActive] = useState(0);
  const current = media[active];

  return (
    <div>
      <div className="relative aspect-3/4 bg-surface overflow-hidden mb-3">
        {!current ? (
          <div className="absolute inset-0 flex items-center justify-center text-beige-dim font-display">
            D_ALLURE
          </div>
        ) : current.type === "image" ? (
          <Image src={current.src} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        ) : (
          <video src={current.src} controls className="w-full h-full object-cover" />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-20 bg-surface border ${i === active ? "border-beige" : "border-line"
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
