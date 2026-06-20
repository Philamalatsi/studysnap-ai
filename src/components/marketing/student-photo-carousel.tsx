"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudentStudyImage } from "@/components/marketing/student-study-image";
import { Badge } from "@/components/ui/badge";
import { STUDENT_PHOTOS } from "@/lib/marketing/landing-images";

const CAROUSEL_SLIDES = STUDENT_PHOTOS.slice(0, 3);
const AUTO_ADVANCE_MS = 4500;

const tabSelectedClass =
  "h-2 w-6 rounded-full bg-brand-600 transition-all duration-300";
const tabUnselectedClass =
  "h-2 w-2 rounded-full bg-brand-200 transition-all duration-300 hover:bg-brand-300";

export function StudentPhotoCarousel() {
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
    setIndex((next + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
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

  const activeSlide = CAROUSEL_SLIDES[index];

  return (
    <div
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Students studying by age group"
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
      <div className="relative aspect-[4/3] w-full min-h-[220px] overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-lg shadow-brand-600/10">
        <div className="absolute inset-0">
          <StudentStudyImage
            key={activeSlide.src}
            src={activeSlide.src}
            alt={activeSlide.alt}
            priority={index === 0}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 text-white">
          <Badge variant="brand" className="mb-2 bg-white/95 text-brand-700">
            {activeSlide.label}
          </Badge>
          <p className="text-sm font-medium leading-snug">{activeSlide.caption}</p>
        </div>

        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        className="mt-3 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Student study levels"
      >
        {CAROUSEL_SLIDES.map((slide, i) => {
          const label = `${slide.label} slide`;
          if (i === index) {
            return (
              <button
                key={slide.label}
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
              key={slide.label}
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
