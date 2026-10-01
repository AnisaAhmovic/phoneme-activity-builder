import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero">
        <p className="eyebrow">Educational activity builder</p>

        <h1>Create phoneme-based learning activities</h1>

        <p className="hero__description">
          Build, preview and export Wordle-style and word-search activities
          using phoneme words stored through a database-backed teacher library.
        </p>

        <div className="hero__actions">
          <Link className="button button--primary" href="/dashboard">View dashboard</Link>
          <Link className="button button--primary" href="/wordle">
            Build a Wordle activity
          </Link>

          <Link className="button button--secondary" href="/word-search">
            Build a word search
          </Link>

          <Link className="button button--secondary" href="/library">
            Manage stored words
          </Link>
        </div>
      </section>

      <section aria-labelledby="activity-heading" className="section">
        <div className="section-heading">
          <p className="eyebrow">Activity options</p>
          <h2 id="activity-heading">Choose an activity</h2>
        </div>

        <div className="activity-grid">
          <article className="activity-card">
            <p className="activity-card__number">01</p>
            <h3>Wordle Builder</h3>
            <p>
              Create a phoneme-based guessing activity using a selected word
              and a configurable game grid.
            </p>
            <Link href="/wordle">Open Wordle Builder</Link>
          </article>

          <article className="activity-card">
            <p className="activity-card__number">02</p>
            <h3>Word Search Builder</h3>
            <p>
              Create a phoneme-based word-search puzzle using a selected list
              of words and grid dimensions.
            </p>
            <Link href="/word-search">Open Word Search Builder</Link>
          </article>

          <article className="activity-card">
            <p className="activity-card__number">03</p>
            <h3>Teacher Library</h3>
            <p>
              Add, retrieve, update and delete word lists and phoneme data
              stored in PostgreSQL.
            </p>
            <Link href="/library">Open Teacher Library</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
