// Editorial WIROOM palette. Tailwind utility names (ink, accent, amber…) are
// configured in index.html; these raw values are for JS contexts that can't use
// classes — chart fills, SVG strokes, slider styles.
export const colors = {
  ink: "#15181E",
  inkSoft: "#545C68",
  muted: "#969DA8",
  line: "rgba(21,24,30,0.12)",
  lineStrong: "rgba(21,24,30,0.18)",
  card: "#FCFCFB",
  canvas: "#ECEDEF",
  accent: "#1F4E87",
  amber: "#9A6B1E",
  forest: "#2C7A57",
  // Fan-chart bands, tinted from the accent blue.
  bandStrong: "rgba(31,78,135,0.20)",
  bandSoft: "rgba(31,78,135,0.075)",
  grid: "rgba(21,24,30,0.07)",
} as const;
