"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseFlashcardsProgress } from "@/features/study-progress/types";
import { useStudyProgress } from "@/features/study-progress/use-study-progress";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/features/flashcards/types";

function shuffleCards(cards: Flashcard[]): Flashcard[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FlashcardStudy({
  materialId,
  cards,
  materialTitle,
}: {
  materialId: string;
  cards: Flashcard[];
  materialTitle: string;
}) {
  const [deck, setDeck] = useState(cards);
  const defaultProgress = useMemo(
    () => ({ cardIndex: 0, flipped: false }),
    [],
  );

  const { progress, updateProgress, clearProgress, loaded } = useStudyProgress(
    materialId,
    "flashcards",
    defaultProgress,
  );

  const saved = useMemo(
    () =>
      parseFlashcardsProgress(
        progress as unknown as Record<string, unknown>,
        deck.length,
      ),
    [progress, deck.length],
  );

  const index = saved.cardIndex;
  const flipped = saved.flipped;
  const current = deck[index];
  const progressPct = deck.length ? ((index + 1) / deck.length) * 100 : 0;

  const hasResume = loaded && (index > 0 || flipped);

  const goNext = useCallback(() => {
    updateProgress((prev) => {
      const p = parseFlashcardsProgress(
        prev as unknown as Record<string, unknown>,
        deck.length,
      );
      return {
        cardIndex: (p.cardIndex + 1) % deck.length,
        flipped: false,
      };
    });
  }, [deck.length, updateProgress]);

  const goPrev = useCallback(() => {
    updateProgress((prev) => {
      const p = parseFlashcardsProgress(
        prev as unknown as Record<string, unknown>,
        deck.length,
      );
      return {
        cardIndex: (p.cardIndex - 1 + deck.length) % deck.length,
        flipped: false,
      };
    });
  }, [deck.length, updateProgress]);

  const toggleFlip = useCallback(() => {
    updateProgress((prev) => {
      const p = parseFlashcardsProgress(
        prev as unknown as Record<string, unknown>,
        deck.length,
      );
      return { ...p, flipped: !p.flipped };
    });
  }, [deck.length, updateProgress]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFlip();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, toggleFlip]);

  const handleShuffle = async () => {
    setDeck(shuffleCards(cards));
    await clearProgress();
  };

  const handleReset = async () => {
    setDeck(cards);
    await clearProgress();
  };

  const label = flipped ? "Answer" : "Question";

  if (!loaded) {
    return <p className="text-sm text-muted">Loading flashcards…</p>;
  }

  if (!current) {
    return (
      <p className="text-sm text-muted">No flashcards available to study.</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {hasResume && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">
          Continuing where you left off — card {index + 1} of {deck.length}.
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} of {deck.length}
        </span>
        <span>{materialTitle}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <button
        type="button"
        onClick={toggleFlip}
        className="w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <Card
          className={cn(
            "min-h-[280px] transition-colors",
            flipped ? "border-brand-300 bg-brand-50" : "bg-white",
          )}
        >
          <CardContent className="flex min-h-[280px] flex-col justify-center p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              {label}
            </p>
            <p className="mt-4 text-lg font-medium leading-relaxed text-foreground">
              {flipped ? current.answer : current.question}
            </p>
            <p className="mt-6 text-sm text-muted">
              Tap card or press Space to flip
            </p>
          </CardContent>
        </Card>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={goPrev}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4" />
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset order
          </Button>
        </div>
        <Button variant="outline" onClick={goNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
