"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultQuizProgress,
  parseQuizProgress,
} from "@/features/study-progress/types";
import { useStudyProgress } from "@/features/study-progress/use-study-progress";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/features/quiz/types";

const CHOICE_LABELS = ["A", "B", "C", "D"] as const;

export function QuizPlayer({
  materialId,
  questions,
  materialTitle,
}: {
  materialId: string;
  questions: QuizQuestion[];
  materialTitle: string;
}) {
  const defaultProgress = useMemo(
    () => defaultQuizProgress(questions.length),
    [questions.length],
  );

  const { progress, updateProgress, clearProgress, loaded } = useStudyProgress(
    materialId,
    "quiz",
    defaultProgress,
  );

  const state = useMemo(
    () =>
      parseQuizProgress(
        progress as unknown as Record<string, unknown>,
        questions.length,
      ),
    [progress, questions.length],
  );

  const current = questions[state.questionIndex];
  const answeredCount = state.selections.filter((s) => s !== null).length;
  const allAnswered = answeredCount === questions.length;
  const progressPct = (answeredCount / questions.length) * 100;

  const score = useMemo(() => {
    if (!state.submitted) return 0;
    return state.selections.reduce<number>((acc, sel, i) => {
      if (sel === questions[i]?.correct_index) return acc + 1;
      return acc;
    }, 0);
  }, [state.selections, state.submitted, questions]);

  const hasResume =
    loaded &&
    !state.submitted &&
    (state.questionIndex > 0 || answeredCount > 0);

  function selectAnswer(choiceIndex: number) {
    if (state.submitted || !current) return;
    updateProgress((prev) => {
      const parsed = parseQuizProgress(
        prev as unknown as Record<string, unknown>,
        questions.length,
      );
      const selections = [...parsed.selections];
      selections[parsed.questionIndex] = choiceIndex;
      return { ...parsed, selections };
    });
  }

  function goToQuestion(next: number) {
    if (state.submitted) return;
    updateProgress((prev) => {
      const parsed = parseQuizProgress(
        prev as unknown as Record<string, unknown>,
        questions.length,
      );
      return {
        ...parsed,
        questionIndex: Math.min(
          Math.max(0, next),
          questions.length - 1,
        ),
      };
    });
  }

  function handleSubmit() {
    if (!allAnswered || state.submitted) return;
    updateProgress((prev) => ({
      ...parseQuizProgress(
        prev as unknown as Record<string, unknown>,
        questions.length,
      ),
      submitted: true,
    }));
  }

  async function handleRetake() {
    await clearProgress();
  }

  if (!loaded) {
    return <p className="text-sm text-muted">Loading quiz…</p>;
  }

  if (state.submitted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-brand-200 bg-brand-50">
          <CardContent className="space-y-4 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">Quiz results</h2>
            <p className="text-muted">{materialTitle}</p>
            <p className="text-4xl font-bold text-brand-600">
              {score} / {questions.length}
            </p>
            <p className="text-sm text-muted">{pct}% correct</p>
            <Button onClick={handleRetake} className="mx-auto">
              <RotateCcw className="h-4 w-4" />
              Retake quiz
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Review & corrections</h3>
          {questions.map((q, i) => {
            const selected = state.selections[i];
            const correct = selected === q.correct_index;
            return (
              <Card
                key={i}
                className={cn(
                  correct ? "border-green-200" : "border-red-200",
                )}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {i + 1}. {q.question}
                      </p>
                      {selected !== null && (
                        <p className="mt-2 text-sm text-muted">
                          Your answer: {CHOICE_LABELS[selected]}.{" "}
                          {q.choices[selected]}
                        </p>
                      )}
                      {!correct && (
                        <p className="mt-1 text-sm font-medium text-green-800">
                          Correct: {CHOICE_LABELS[q.correct_index]}.{" "}
                          {q.choices[q.correct_index]}
                        </p>
                      )}
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="text-sm text-muted">No quiz questions available.</p>
    );
  }

  const currentSelection = state.selections[state.questionIndex];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {hasResume && (
        <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800">
          Continuing where you left off — question {state.questionIndex + 1},{" "}
          {answeredCount} of {questions.length} answered.
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Question {state.questionIndex + 1} of {questions.length}
        </span>
        <span>{materialTitle}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <Card>
        <CardContent className="space-y-6 p-6">
          <p className="text-lg font-medium leading-relaxed text-foreground">
            {current.question}
          </p>

          <ul className="space-y-2">
            {current.choices.map((choice, i) => {
              const isSelected = currentSelection === i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => selectAnswer(i)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      isSelected
                        ? "border-brand-500 bg-brand-50"
                        : "border-border hover:border-brand-300 hover:bg-brand-50/50",
                    )}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                      {CHOICE_LABELS[i]}
                    </span>
                    <span className="flex-1">{choice}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={state.questionIndex === 0}
              onClick={() => goToQuestion(state.questionIndex - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {state.questionIndex + 1 < questions.length ? (
              <Button
                variant="outline"
                disabled={currentSelection === null}
                onClick={() => goToQuestion(state.questionIndex + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={!allAnswered} onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                Submit quiz
              </Button>
            )}
          </div>

          {allAnswered && state.questionIndex + 1 < questions.length && (
            <div className="flex justify-end border-t border-border pt-4">
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4" />
                Submit quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
