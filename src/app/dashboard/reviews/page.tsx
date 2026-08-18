"use client";

import { useEffect, useState } from "react";
import { Check, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/reviews");
    setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setApproved(id: string, approved: boolean) {
    await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    toast.success(approved ? "Review approved" : "Review rejected");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-beige mb-8">Reviews</h1>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No reviews yet.</p>
      ) : (
        <div className="border border-line">
          {reviews.map((r) => (
            <div key={r._id} className="px-5 py-4 border-b border-line last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={12} className={n <= r.rating ? "fill-burgundy-bright text-burgundy-bright" : "text-line"} />
                    ))}
                    <span className="font-mono text-[10px] text-beige-dim uppercase tracking-wider ml-2">
                      {r.name} · {r.trackingId}
                    </span>
                  </div>
                  <p className="text-sm text-beige">{r.comment}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!r.approved && (
                    <button
                      onClick={() => setApproved(r._id, true)}
                      className="w-7 h-7 flex items-center justify-center border border-line text-beige-dim hover:text-green-400 hover:border-green-400"
                      title="Approve"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {r.approved && (
                    <button
                      onClick={() => setApproved(r._id, false)}
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-beige text-beige"
                    >
                      Approved
                    </button>
                  )}
                  <button
                    onClick={() => remove(r._id)}
                    className="w-7 h-7 flex items-center justify-center border border-line text-beige-dim hover:text-burgundy-bright hover:border-burgundy-bright"
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
