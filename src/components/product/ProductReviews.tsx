"use client";

import { useState } from "react";
import { Star, BadgeCheck, MessageCircle } from "lucide-react";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "fill-primary text-primary" : "text-line"}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productTitle,
  reviews,
  summary,
}: {
  productTitle: string;
  reviews: Review[];
  summary: { average: number; count: number; breakdown: Record<1 | 2 | 3 | 4 | 5, number> };
}) {
  const [showWriteReviewNote, setShowWriteReviewNote] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start">
        <div className="shrink-0 sm:w-56">
          <div className="text-4xl font-semibold">{summary.count ? summary.average.toFixed(1) : "—"}</div>
          <StarRow rating={summary.average} size={16} />
          <p className="mt-1 text-xs text-ink-400">
            {summary.count} review{summary.count === 1 ? "" : "s"}
          </p>

          <button
            onClick={() => setShowWriteReviewNote(true)}
            className="btn-secondary mt-5 w-full text-xs"
          >
            Write a Review
          </button>
          {showWriteReviewNote && (
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-400">
              <MessageCircle size={13} className="mt-0.5 shrink-0" />
              Review submission isn&apos;t live yet — reach us on WhatsApp from the product page above in the meantime.
            </p>
          )}
        </div>

        <div className="flex-1">
          {([5, 4, 3, 2, 1] as const).map((stars) => {
            const count = summary.breakdown[stars];
            const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 py-1 text-xs text-ink-400">
                <span className="w-10 shrink-0">{stars} star</span>
                <div className="h-1.5 flex-1 bg-line">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-col divide-y divide-line border-t border-line">
        {reviews.length === 0 ? (
          <p className="py-8 text-sm text-ink-400">
            No reviews yet for {productTitle} — be the first to share your experience once review submission opens.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="py-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{review.authorName}</span>
                    {review.verifiedPurchase && (
                      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-secondary">
                        <BadgeCheck size={12} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <span className="shrink-0 text-xs text-ink-400">
                  {new Date(review.createdAt).toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              <h4 className="mt-3 text-sm font-medium text-ink">{review.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{review.body}</p>
              {review.photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {review.photos.map((photo) => (
                    <div key={photo} className={cn("h-16 w-16 bg-mist")} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
