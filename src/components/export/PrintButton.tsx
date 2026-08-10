"use client";

type PrintMode =
  | "wordle-activity"
  | "word-search-puzzle"
  | "word-search-answer";

type PrintButtonProps = {
  label: string;
  mode: PrintMode;
};

export default function PrintButton({ label, mode }: PrintButtonProps) {
  function handlePrint(): void {
    const root = document.documentElement;
    const previousMode = root.dataset.printMode;

    function restorePrintMode(): void {
      if (previousMode) {
        root.dataset.printMode = previousMode;
      } else {
        delete root.dataset.printMode;
      }
    }

    root.dataset.printMode = mode;
    window.addEventListener("afterprint", restorePrintMode, { once: true });
    window.print();
  }

  return (
    <button
      className="button button--secondary print-button"
      onClick={handlePrint}
      type="button"
    >
      {label}
    </button>
  );
}
