import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  FileUp,
  GraduationCap,
  Layers,
  School,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StudentPhotoCarousel } from "@/components/marketing/student-photo-carousel";
import { SocialProofSection } from "@/components/marketing/social-proof";
import { StudyLevelsCarousel } from "@/components/marketing/study-levels-carousel";
import { PremiumWaitlistForm } from "@/components/marketing/premium-waitlist-form";
import { StudentStudyImage } from "@/components/marketing/student-study-image";
import { FREE_UPLOAD_LIMIT } from "@/lib/constants";
import { LOCAL_IMAGES, STUDENT_PHOTOS } from "@/lib/marketing/landing-images";

const features = [
  {
    icon: FileUp,
    title: "Any format",
    description:
      "Snap textbook pages, handwritten notes, screenshots, or PDFs — whatever you use in class.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: Sparkles,
    title: "AI summaries",
    description:
      "Turn long chapters and messy notes into clear, bite-sized summaries you can actually remember.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description:
      "Auto-generated question-and-answer cards so you can review on the bus, between classes, or at home.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Brain,
    title: "Practice quizzes",
    description:
      "Multiple-choice quizzes with explanations — built from what you uploaded, not random internet trivia.",
    color: "bg-sky-100 text-sky-600",
  },
];

const steps = [
  {
    step: "1",
    title: "Upload",
    text: "Take a photo or drop a file — notes, worksheets, textbook pages, anything.",
  },
  {
    step: "2",
    title: "Extract",
    text: "We read the text from your images and PDFs automatically.",
  },
  {
    step: "3",
    title: "Study",
    text: "Generate summaries, flip through flashcards, and take practice quizzes.",
  },
];

const studentLevels = [
  {
    icon: School,
    title: "Primary school",
    text: "Spelling lists, story pages, and homework sheets — made into fun review cards.",
  },
  {
    icon: BookOpen,
    title: "High school",
    text: "Exam notes, textbook chapters, and lab handouts — summarized in minutes.",
  },
  {
    icon: GraduationCap,
    title: "University & beyond",
    text: "Lecture slides, journal PDFs, and dense readings — turned into study tools.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

        {/* Mobile: headline directly below nav */}
        <div className="relative border-b border-brand-100/80 bg-gradient-to-b from-brand-50 to-white px-4 pb-5 pt-6 text-center lg:hidden">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Your notes, turned into
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              study magic
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Upload notes and school materials — get AI summaries, flashcards,
            and quizzes in seconds.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                <Zap className="h-4 w-4" />
                Start free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Log in
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile: student photo carousel (primary → university) */}
        <div className="relative px-4 py-5 lg:hidden">
          <StudentPhotoCarousel />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <Badge variant="brand" className="mb-5 hidden lg:inline-flex">
              <Users className="mr-1 inline h-3.5 w-3.5" />
              For every student, every subject
            </Badge>
            <h1 className="hidden text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:block lg:text-[3.25rem] lg:leading-tight">
              Your notes, turned into{" "}
              <span className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
                study magic
              </span>
            </h1>
            <p className="hidden max-w-xl text-base leading-relaxed text-muted lg:mt-6 lg:block lg:text-lg">
              StudySnap AI helps learners of all ages upload school materials and
              get AI summaries, flashcards, and quizzes — so studying feels less
              overwhelming and a lot more fun.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
              {["Primary", "High school", "University", "Homeschool"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
            <div className="mt-8 hidden flex-wrap gap-4 lg:flex">
              <Link href="/signup">
                <Button size="lg">
                  <Zap className="h-4 w-4" />
                  Start free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Log in
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-center text-sm text-muted lg:text-left">
              Free plan: {FREE_UPLOAD_LIMIT} uploads per month. No credit card
              needed.
            </p>
          </div>

          <div className="relative mx-auto hidden w-full max-w-lg lg:block lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-brand-200/60 bg-white shadow-xl shadow-brand-600/10">
              <Image
                src={LOCAL_IMAGES.heroStudents}
                alt="Colourful illustration of diverse students of different ages studying together"
                width={800}
                height={500}
                className="h-auto w-full object-cover object-center"
                priority
                unoptimized
              />
            </div>
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-white p-3 shadow-lg sm:block">
              <p className="text-xs font-medium text-muted">Trusted by learners</p>
              <p className="text-sm font-semibold text-foreground">
                Summaries · Flashcards · Quizzes
              </p>
            </div>
          </div>
        </div>
      </section>

      <SocialProofSection />

      {/* Student gallery — desktop/tablet grid; mobile uses hero carousel */}
      <section
        id="student-gallery"
        className="hidden border-b border-border bg-white py-16 sm:py-20 lg:block"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Made for real students, real classrooms
            </h2>
            <p className="mt-3 text-muted">
              Whether you&apos;re in grade 3 or grad school, StudySnap works with
              the materials you already have — no matter your background or
              learning style.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STUDENT_PHOTOS.map((photo) => (
              <figure
                key={photo.label}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] min-h-[180px] overflow-hidden">
                  <StudentStudyImage
                    src={photo.src}
                    alt={photo.alt}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-3 left-3 right-3">
                    <Badge variant="brand" className="mb-1">
                      {photo.label}
                    </Badge>
                    <p className="text-xs text-white/90">{photo.caption}</p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-b border-border bg-white py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Everything you need to study smarter
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted">
          Upload once — get tools that help you understand, remember, and test
          yourself.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-border/80 transition-shadow hover:shadow-md"
            >
              <CardContent>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* Who it's for */}
      <section
        id="students"
        className="border-y border-border bg-gradient-to-br from-brand-50 to-violet-50/50 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <StudyLevelsCarousel />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:mt-12">
            <div className="hidden overflow-hidden rounded-2xl border border-brand-200/50 shadow-lg lg:block">
              <Image
                src={LOCAL_IMAGES.studyLevels}
                alt="Illustration of primary, high school, and university students studying in colourful scenes"
                width={700}
                height={700}
                className="h-auto w-full object-center"
                unoptimized
              />
            </div>
            <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Every age. Every subject.
            </h2>
            <p className="mt-3 text-muted">
              StudySnap is built to welcome all learners — different ages,
              languages, and school systems. If you can photograph it or upload
              it, we can help you study it.
            </p>
            <ul className="mt-8 space-y-5">
              {studentLevels.map((level) => (
                <li key={level.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <level.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{level.title}</h3>
                    <p className="mt-1 text-sm text-muted">{level.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-b border-border bg-white py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted">
            Three simple steps — from messy notes to ready-to-study materials.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl border border-border bg-surface-muted p-6 text-center"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white shadow-md shadow-brand-600/25">
                  {s.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-b border-border bg-white py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Simple pricing
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-muted">
          Start free today. Upgrade when you need more uploads.
        </p>
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-3xl font-bold">
                $0
                <span className="text-base font-normal text-muted">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>{FREE_UPLOAD_LIMIT} uploads per month</li>
                <li>AI summaries, flashcards & quizzes</li>
                <li>OCR for images and PDFs</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button variant="outline" fullWidth>
                  Get started
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-brand-300 ring-1 ring-brand-200">
            <CardContent>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Premium</h3>
                <Badge variant="brand">Coming soon</Badge>
              </div>
              <p className="mt-1 text-3xl font-bold">
                TBD
                <span className="text-base font-normal text-muted">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>Unlimited uploads</li>
                <li>Priority AI generation</li>
                <li>AI tutor (planned)</li>
              </ul>
              <PremiumWaitlistForm />
            </CardContent>
          </Card>
        </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-brand-700 bg-brand-600 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/hero-students.png')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to make studying easier?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-100">
            Join students who are turning their notes into summaries, flashcards,
            and quizzes — free to start, no credit card required.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button
              size="lg"
              className="bg-white text-brand-700 hover:bg-brand-50"
            >
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      <p className="border-t border-border py-4 text-center text-xs text-muted">
        Illustrations created for StudySnap AI.
      </p>
    </>
  );
}
