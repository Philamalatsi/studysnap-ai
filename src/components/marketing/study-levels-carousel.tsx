"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StudentStudyImage } from "@/components/marketing/student-study-image";
import { Badge } from "@/components/ui/badge";
import { LOCAL_IMAGES } from "@/lib/marketing/landing-images";

const SLIDES = [
  {
    src: LOCAL_IMAGES.carouselPrimary,
    alt: "Primary school students studying",
    label: "Primary school",
  },
  {
    src: LOCAL_IMAGES.carouselHighSchool,
    alt: "High school students studying",
    label: "High school",
  },
  {
    src: LOCAL_IMAGES.carouselUniversity,
    alt: "University students studying",
    label: "University",
  },
] as const;

const AUTO_ADVANCE_MS = 5000;

const tabSelectedClass = "h-2 w-5 rounded-full bg-brand-600 transition-all";
const tabUnselectedClass = "h-2 w-2 rounded-full bg-brand-200 transition-all";

export function StudyLevelsCarousel() {
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
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
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

  const active = SLIDES[index];

  return (
    <div
      className="relative w-full lg:hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Student age groups"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        if (Math.abs(delta) > 40) {
          if (delta < 0) goNext();
          else goPrev();
        }
        setTouchStartX(null);
      }}
    >
      <div className="relative aspect-[4/3] min-h-[200px] overflow-hidden rounded-2xl border border-brand-200/50 shadow-md">
        <div className="absolute inset-0">
          <StudentStudyImage src={active.src} alt={active.alt} priority />
        </div>
        <div className="absolute bottom-3 left-3 z-10">
          <Badge variant="brand" className="bg-white/95 text-brand-700">
            {active.label}
          </Badge>
        </div>
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 flex justify-center gap-2" role="tablist">
        {SLIDES.map((slide, i) => {
          if (i === index) {
            return (
              <button
                key={slide.label}
                type="button"
                role="tab"
                aria-selected="true"
                aria-label={slide.label}
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
              aria-label={slide.label}
              onClick={() => goTo(i)}
              className={tabUnselectedClass}
            />
          );
        })}
      </div>
    </div>
  );
}
