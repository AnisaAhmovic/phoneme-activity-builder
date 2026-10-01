import type { Metadata } from "next";

import TeacherLibrary from "@/components/library/TeacherLibrary";

export const metadata: Metadata = {
  title: "Teacher Library",
  description:
    "Create, retrieve, update and delete stored phoneme word lists.",
};

export default function LibraryPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="page-heading">
        <p className="eyebrow">Backend and database</p>
        <h1>Teacher Library</h1>
        <p>
          Manage phoneme word lists stored in PostgreSQL. Saved words are
          available in both activity builders.
        </p>
      </div>

      <TeacherLibrary />
    </main>
  );
}
