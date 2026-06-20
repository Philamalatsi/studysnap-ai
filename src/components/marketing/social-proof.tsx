import { BookOpen, GraduationCap, Sparkles, Users } from "lucide-react";
import { QuoteCard } from "@/components/marketing/quote-card";
import { ReviewsCarousel } from "@/components/marketing/reviews-carousel";
import { REVIEWS } from "@/lib/marketing/reviews";

const STATS = [
  { icon: Users, label: "All learners welcome", value: "Primary → University" },
  { icon: BookOpen, label: "Study formats", value: "Summaries · Flashcards · Quizzes" },
  { icon: Sparkles, label: "Works with", value: "Photos, notes & PDFs" },
  { icon: GraduationCap, label: "Built for", value: "Real classrooms" },
] as const;

export function SocialProofSection() {
  return (
    <section className="border-b border-border bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for how students actually study
          </h2>
          <p className="mt-3 text-muted">
            From primary school spelling lists to university lecture PDFs — one
            place for summaries, flashcards, and quizzes.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-surface-muted px-4 py-5 text-center"
            >
              <Icon className="mx-auto h-5 w-5 text-brand-600" aria-hidden />
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What students say
            </h2>
            <p className="mt-3 text-muted">
              Real learners using StudySnap to turn notes into study tools they
              actually use.
            </p>
          </div>
          <div className="mt-8">
            <ReviewsCarousel />
            <div className="hidden gap-4 md:grid md:grid-cols-2">
              {REVIEWS.map((review) => (
                <QuoteCard key={review.id} text={review.text} who={review.who} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
