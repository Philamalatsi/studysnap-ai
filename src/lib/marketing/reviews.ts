export type Review = {
  id: string;
  text: string;
  who: string;
};

export const REVIEWS: Review[] = [
  {
    id: "hs-flashcards",
    text: "I upload my textbook pages and get flashcards before the bus ride home.",
    who: "High school student",
  },
  {
    id: "uni-pdfs",
    text: "Perfect for lecture PDFs — the summary hits every key point.",
    who: "University student",
  },
  {
    id: "primary-spelling",
    text: "My spelling lists turn into flashcards before dinner — I actually enjoy practising now.",
    who: "Primary school student",
  },
  {
    id: "homeschool-quiz",
    text: "We upload the week's worksheets once and every kid gets their own quiz.",
    who: "Homeschool parent",
  },
];
