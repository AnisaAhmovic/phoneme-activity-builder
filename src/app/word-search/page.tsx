import type { Metadata } from "next";

import WordSearchBuilder from "@/components/word-search/WordSearchBuilder";

export const metadata: Metadata = {
  title: "Word Search Builder",
  description:
    "Configure and preview an interactive word-search activity using phoneme symbols.",
};

export default function WordSearchPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="page-heading">
        <p className="eyebrow">Activity builder</p>
        <h1>Word Search Builder</h1>

        <p>
          Select words from a teacher-managed list, configure and save the
          puzzle, then drag across the grid to find words in any straight
          direction.
        </p>
      </div>

      <WordSearchBuilder />
    </main>
  );
}
