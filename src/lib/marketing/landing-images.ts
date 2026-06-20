/** Carousel + gallery images — local PNG illustrations (correct orientation, no EXIF issues) */
export const STUDENT_PHOTOS = [
  {
    src: "/images/carousel-primary.png",
    alt: "Colourful illustration of diverse primary school children reading and studying in a classroom",
    label: "Primary school",
    caption: "Picture books, worksheets, and early readers",
  },
  {
    src: "/images/carousel-high-school.png",
    alt: "Colourful illustration of diverse high school students studying with notebooks in a classroom",
    label: "High school",
    caption: "Notes, textbook pages, and exam prep",
  },
  {
    src: "/images/carousel-university.png",
    alt: "Colourful illustration of diverse university students studying with laptops in a library",
    label: "University",
    caption: "Lecture slides, PDFs, and research papers",
  },
  {
    src: "/images/hero-students.png",
    alt: "Colourful illustration of diverse students of all ages studying together",
    label: "Every learner",
    caption: "Homeschool, college, night school — all welcome",
  },
] as const;

export const LOCAL_IMAGES = {
  heroStudents: "/images/hero-students.png",
  studyLevels: "/images/study-levels.png",
  carouselPrimary: "/images/carousel-primary.png",
  carouselHighSchool: "/images/carousel-high-school.png",
  carouselUniversity: "/images/carousel-university.png",
} as const;
