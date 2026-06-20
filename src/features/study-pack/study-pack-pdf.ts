import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { parseFlashcardsContent } from "@/features/flashcards/types";
import { parseQuizContent } from "@/features/quiz/types";
import { parseSummaryContent } from "@/features/summary/types";
import type { StudyOutput } from "@/types/database";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const BODY_SIZE = 11;
const HEADING_SIZE = 16;
const SUBHEADING_SIZE = 13;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type PdfContext = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
};

function ensureSpace(ctx: PdfContext, needed: number) {
  if (ctx.y - needed >= MARGIN) return;
  ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
}

function drawLines(
  ctx: PdfContext,
  lines: string[],
  options?: { size?: number; bold?: boolean; indent?: number; color?: ReturnType<typeof rgb> },
) {
  const size = options?.size ?? BODY_SIZE;
  const font = options?.bold ? ctx.fontBold : ctx.font;
  const indent = options?.indent ?? 0;
  const color = options?.color ?? rgb(0.15, 0.15, 0.15);
  const maxWidth = PAGE_WIDTH - MARGIN * 2 - indent;

  for (const paragraph of lines.join("\n").split("\n")) {
    const wrapped = wrapText(paragraph, font, size, maxWidth);
    for (const line of wrapped) {
      ensureSpace(ctx, LINE_HEIGHT);
      ctx.page.drawText(line, {
        x: MARGIN + indent,
        y: ctx.y,
        size,
        font,
        color,
      });
      ctx.y -= LINE_HEIGHT;
    }
    ctx.y -= 4;
  }
}

function drawHeading(ctx: PdfContext, text: string) {
  ctx.y -= 8;
  drawLines(ctx, [text], { size: HEADING_SIZE, bold: true, color: rgb(0.35, 0.2, 0.7) });
  ctx.y -= 4;
}

function drawSubheading(ctx: PdfContext, text: string) {
  drawLines(ctx, [text], { size: SUBHEADING_SIZE, bold: true });
  ctx.y -= 2;
}

export async function buildStudyPackPdf(params: {
  materialTitle: string;
  summaryOutput: StudyOutput | null;
  flashcardsOutput: StudyOutput | null;
  quizOutput: StudyOutput | null;
}): Promise<Uint8Array> {
  const summary = parseSummaryContent(params.summaryOutput?.content ?? null);
  const flashcards = parseFlashcardsContent(
    params.flashcardsOutput?.content ?? null,
  );
  const quiz = parseQuizContent(params.quizOutput?.content ?? null);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ctx: PdfContext = {
    doc,
    page,
    font,
    fontBold,
    y: PAGE_HEIGHT - MARGIN,
  };

  drawLines(ctx, ["StudySnap AI — Study Pack"], {
    size: 20,
    bold: true,
    color: rgb(0.35, 0.2, 0.7),
  });
  drawLines(ctx, [params.materialTitle], { size: 14, bold: true });
  drawLines(ctx, [`Generated ${new Date().toLocaleDateString()}`], {
    size: 9,
    color: rgb(0.45, 0.45, 0.45),
  });
  ctx.y -= 8;

  if (summary) {
    drawHeading(ctx, "Summary");
    drawLines(ctx, summary.summary.split("\n"));
  }

  if (flashcards && flashcards.flashcards.length > 0) {
    drawHeading(ctx, "Flashcards");
    flashcards.flashcards.forEach((card, i) => {
      drawSubheading(ctx, `Card ${i + 1}`);
      drawLines(ctx, [`Q: ${card.question}`], { bold: true });
      drawLines(ctx, [`A: ${card.answer}`], { indent: 12 });
      ctx.y -= 4;
    });
  }

  if (quiz && quiz.questions.length > 0) {
    drawHeading(ctx, "Practice quiz");
    quiz.questions.forEach((q, i) => {
      drawSubheading(ctx, `Question ${i + 1}`);
      drawLines(ctx, [q.question], { bold: true });
      q.choices.forEach((choice, ci) => {
        const label = String.fromCharCode(65 + ci);
        drawLines(ctx, [`${label}. ${choice}`], { indent: 12 });
      });
      ctx.y -= 2;
    });

    drawHeading(ctx, "Answer key");
    quiz.questions.forEach((q, i) => {
      const correct = q.choices[q.correct_index] ?? "";
      const label = String.fromCharCode(65 + q.correct_index);
      drawLines(ctx, [`${i + 1}. ${label}. ${correct}`], { bold: true });
      drawLines(ctx, [q.explanation], { indent: 12, size: 10 });
      ctx.y -= 2;
    });
  }

  return doc.save();
}
