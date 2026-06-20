"use client";

import { useCallback, useEffect, useState } from "react";
import { QuoteCard } from "@/components/marketing/quote-card";
import { REVIEWS } from "@/lib/marketing/reviews";

const AUTO_ADVANCE_MS = 4500;

const tabSelectedClass =
  "h-2 w-6 rounded-full bg-brand-600 transition-all duration-300";
const tabUnselectedClass =
  "h-2 w-2 rounded-full bg-brand-200 transition-all duration-300 hover:bg-brand-300";

export function ReviewsCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex((next + REVIEWS.length) % REVIEWS.length);
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % REVIEWS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const active = REVIEWS[index];

  return (
    <div
      className="md:hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Student reviews"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const delta =
          (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        if (Math.abs(delta) > 40) {
          if (delta < 0) goNext();
          else goPrev();
        }
        setTouchStartX(null);
        setPaused(false);
      }}
    >
      <QuoteCard
        key={active.id}
        text={active.text}
        who={active.who}
        className="min-h-[7.5rem] rounded-xl border border-brand-100 bg-brand-50/40 px-5 py-4"
      />
      <p className="sr-only">Swipe left or right to browse reviews.</p>
      <div
        className="mt-3 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Review slides"
      >
        {REVIEWS.map((review, i) => {
          const label = `Review ${i + 1} of ${REVIEWS.length}`;
          if (i === index) {
            return (
              <button
                key={review.id}
                type="button"
                role="tab"
                aria-selected="true"
                aria-label={label}
                onClick={() => goTo(i)}
                className={tabSelectedClass}
              />
            );
          }
          return (
            <button
              key={review.id}
              type="button"
              role="tab"
              aria-selected="false"
              aria-label={label}
              onClick={() => goTo(i)}
              className={tabUnselectedClass}
            />
          );
        })}
      </div>
    </div>
  );
}
