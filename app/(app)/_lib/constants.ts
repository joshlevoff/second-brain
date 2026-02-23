export const CATEGORIES = [
  "Unprocessed",
  "Studies",
  "Rules",
  "Articles",
  "Courses",
  "Literature I Love",
] as const;

export const SOURCE_TYPES = [
  "Note",
  "Book",
  "Article",
  "Podcast",
  "YouTube",
  "URL",
  "Course",
  "Other",
] as const;

export const CAT_STYLE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Unprocessed:       { bg: "#f0e6d3", text: "#7a5c2e", border: "#d4a96a" },
  Studies:           { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  Rules:             { bg: "#dbeafe", text: "#1e3a8a", border: "#60a5fa" },
  Articles:          { bg: "#fce7f3", text: "#831843", border: "#f472b6" },
  Courses:           { bg: "#ede9fe", text: "#4c1d95", border: "#a78bfa" },
  "Literature I Love": { bg: "#d1fae5", text: "#065f46", border: "#34d399" },
};

export const LEVEL_COLORS = [
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
];

export const SOURCE_ICONS: Record<string, string> = {
  Book:    "📖",
  Article: "📰",
  Podcast: "🎙",
  YouTube: "▶️",
  URL:     "🔗",
  Note:    "📝",
  Course:  "🎓",
  Other:   "📌",
};
