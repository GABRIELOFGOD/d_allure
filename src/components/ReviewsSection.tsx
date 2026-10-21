"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Review } from "@/types";

export default function ReviewsSection({ productId, initialReviews }: { productId: string; initialReviews: Review[] }) {
  const [reviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ trackingId: "", name: "", rating: 5, comment: "" });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function submitReview() {
    if (!form.trackingId || !form.name || !form.comment) {
      toast.error("Please fill in your tracking ID, name and comment");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't submit review");
        return;
      }
      toast.success("Thanks! Your review is pending approval.");
      setShowForm(false);
      setForm({ trackingId: "", name: "", rating: 5, comment: "" });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-beige">
          Reviews {avgRating && <span className="font-mono text-sm text-beige-dim">({avgRating} / 5)</span>}
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim hover:text-beige border border-line px-4 py-2"
        >
          Write a Review
        </button>
      </div>

      {showForm && (
        <div className="border border-line p-5 mb-8 flex flex-col gap-4">
          <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus">
            Only verified buyers can review — enter the order tracking ID we emailed you.
          </p>
          <input
            placeholder="Order Tracking ID"
            value={form.trackingId}
            onChange={(e) => setForm((f) => ({ ...f, trackingId: e.target.value }))}
            className="bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim"
          />
          <input
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim"
          />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setForm((f) => ({ ...f, rating: n }))} aria-label={`${n} stars`}>
                <Star size={20} className={n <= form.rating ? "fill-burgundy-bright text-burgundy-bright" : "text-line"} />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your experience..."
            rows={3}
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            className="bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige outline-none focus:border-beige-dim resize-none"
          />
          <button
            onClick={submitReview}
            disabled={submitting}
            className="bg-burgundy hover:bg-burgundy-hover text-white py-3 font-mono text-xs tracking-widest-plus uppercase transition-colors flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Submit Review
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No reviews yet — be the first verified buyer to share one.</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {reviews.map((r) => (
            <li key={r._id} className="border-b border-line pb-6">
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={13} className={n <= r.rating ? "fill-burgundy-bright text-burgundy-bright" : "text-line"} />
                ))}
              </div>
              <p className="text-sm text-beige mb-1">{r.comment}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest-plus text-beige-dim">{r.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
