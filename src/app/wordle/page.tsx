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
          Select a target word and preview a Wordle-style phoneme activity.
          Each phoneme occupies one grid cell.
        </p>
      </div>

      <WordleBuilder />
    </main>
  );
}
