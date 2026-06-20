export type StudyMode = "summary" | "flashcards" | "quiz";

export type QuizProgress = {
  questionIndex: number;
  selections: (number | null)[];
  submitted: boolean;
};

export type FlashcardsProgress = {
  cardIndex: number;
  flipped: boolean;
};

export type SummaryProgress = {
  scrollTop: number;
};

export type StudyProgressPayload =
  | QuizProgress
  | FlashcardsProgress
  | SummaryProgress;

export function defaultQuizProgress(questionCount: number): QuizProgress {
  return {
    questionIndex: 0,
    selections: Array.from({ length: questionCount }, () => null),
    submitted: false,
  };
}

export function parseQuizProgress(
  raw: Record<string, unknown> | null,
  questionCount: number,
): QuizProgress {
  const fallback = defaultQuizProgress(questionCount);
  if (!raw) return fallback;

  const questionIndex =
    typeof raw.questionIndex === "number" ? raw.questionIndex : 0;
  const submitted = raw.submitted === true;
  let selections: (number | null)[] = fallback.selections;

  if (Array.isArray(raw.selections)) {
    selections = raw.selections.map((v) =>
      typeof v === "number" ? v : null,
    );
    while (selections.length < questionCount) selections.push(null);
    selections = selections.slice(0, questionCount);
  }

  return {
    questionIndex: Math.min(Math.max(0, questionIndex), questionCount - 1),
    selections,
    submitted,
  };
}

export function parseFlashcardsProgress(
  raw: Record<string, unknown> | null,
  deckLength: number,
): FlashcardsProgress {
  const cardIndex =
    typeof raw?.cardIndex === "number"
      ? Math.min(Math.max(0, raw.cardIndex), Math.max(0, deckLength - 1))
      : 0;
  return {
    cardIndex,
    flipped: raw?.flipped === true,
  };
}

export function parseSummaryProgress(
  raw: Record<string, unknown> | null,
): SummaryProgress {
  return {
    scrollTop: typeof raw?.scrollTop === "number" ? raw.scrollTop : 0,
  };
}
