import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      <div className="page-heading">
        <p className="eyebrow">About the project</p>
        <h1>About</h1>
        <p>
          The Phoneme Activity Builder helps teachers create phoneme-based
          classroom activities for Speech Pathology students.
        </p>
      </div>

      <section className="about-layout" aria-labelledby="about-purpose-heading">
        <div className="about-copy">
          <h2 id="about-purpose-heading">Purpose</h2>
          <p>
            The current version focuses on the frontend interface, usability,
            accessibility and responsive design. It provides working Wordle and
            Word Search builders using the supplied phoneme corpus.
          </p>
          <p>
            Database support and dynamic word-list management can be introduced
            in later development without changing the current activity workflow.
          </p>
        </div>

        <aside className="about-summary" aria-label="Current application scope">
          <p className="eyebrow">Current scope</p>
          <dl>
            <div>
              <dt>Activities</dt>
              <dd>2 interactive builders</dd>
            </div>
            <div>
              <dt>Word sets</dt>
              <dd>3, 4 and 5 phonemes</dd>
            </div>
            <div>
              <dt>Interface</dt>
              <dd>Responsive web application</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section aria-labelledby="about-activities-heading" className="section">
        <div className="section-heading">
          <p className="eyebrow">Available activities</p>
          <h2 id="about-activities-heading">Choose a builder</h2>
        </div>

        <div className="activity-grid">
          <article className="activity-card">
            <p className="activity-card__number">01</p>
            <h3>Wordle Builder</h3>
            <p>
              Create a phoneme-based guessing activity using one selected word,
              a six-row grid and the phoneme keyboard.
            </p>
            <Link href="/wordle">Open Wordle Builder</Link>
          </article>

          <article className="activity-card">
            <p className="activity-card__number">02</p>
            <h3>Word Search Builder</h3>
            <p>
              Select phoneme-based words, generate a grid and find the placed
              words horizontally, vertically or diagonally.
            </p>
            <Link href="/word-search">Open Word Search Builder</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
