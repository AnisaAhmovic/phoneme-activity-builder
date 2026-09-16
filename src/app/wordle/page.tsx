import type { Metadata } from "next";

import WordleBuilder from "@/components/wordle/WordleBuilder";

export const metadata: Metadata = {
  title: "Wordle Builder",
  description:
    "Configure and preview a Wordle-style activity using phoneme symbols.",
};

export default function WordlePage() {
  return (
    <main>
      <div className="page-heading">
        <p className="eyebrow">Activity builder</p>
        <h1>Wordle Builder</h1>

        <p>
          Select a database-backed target word, configure the output and save
          the activity for later. Each phoneme occupies one grid cell.
        </p>
      </div>

      <WordleBuilder />
    </main>
  );
}
