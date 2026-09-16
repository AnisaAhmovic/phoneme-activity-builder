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
            Assessment 2 extends the accessible frontend with a PostgreSQL
            database, Prisma data model and validated Next.js route handlers.
            Teachers can create, retrieve, update and delete their own word
            lists, phoneme sequences and reusable activity configurations.
          </p>
          <p>
            Both builders read teacher-managed content through the backend API
            and still generate self-contained HTML activities that work away
            from the application server. The full application and database can
            also be started together with Docker Compose.
          </p>
        </div>

        <aside className="about-summary" aria-label="Current application scope">
          <p className="eyebrow">Student and scope</p>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>Anisa Ahmovic</dd>
            </div>
            <div>
              <dt>Student number</dt>
              <dd>22318777</dd>
            </div>
            <div>
              <dt>Activities</dt>
              <dd>Wordle and Word Search</dd>
            </div>
            <div>
              <dt>Output</dt>
              <dd>Standalone playable HTML</dd>
            </div>
            <div>
              <dt>Backend</dt>
              <dd>Next.js API, Prisma and PostgreSQL</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section aria-labelledby="about-video-heading" className="section">
        <div className="section-heading">
          <p className="eyebrow">Original interface guide</p>
          <h2 id="about-video-heading">How to use the activity builders</h2>
          <p>
            This Assessment 1 guide demonstrates the retained activity
            workflow. Assessment 2 adds database-backed content management and
            saved configurations without removing these interactions.
          </p>
        </div>

        <div className="about-video-card">
          <video className="about-video" controls preload="metadata">
            <source
              src="/phoneme-activity-builder-guide.mp4"
              type="video/mp4"
            />
            Your browser does not support embedded video.
          </video>

          <details className="about-video-transcript">
            <summary>Read the video transcript</summary>
            <div>
              <p>
                Hi, my name is Anisa Ahmovic. This is a quick walkthrough of
                my Phoneme Activity Builder website.
              </p>

              <p>
                There are five main pages available from the navigation at the
                top right. If you are using a tablet or mobile device, the
                navigation changes to a hamburger menu. The Home page provides
                quick access to the Wordle and Word Search builders.
              </p>

              <p>
                If you select Build a Wordle activity, you can choose the
                number of phonemes you want in the Wordle. The activity
                automatically updates the preview for you. There is also a
                phoneme keyboard available.
              </p>

              <p>
                When the activity is ready, select Generate HTML. The HTML file
                appears in your Downloads folder and can be opened directly in
                a normal web browser. Hovering over a phoneme shows its English
                equivalence. In this example, the target word is bit. If a
                phoneme is incorrect, the cell remains grey. If the correct
                phoneme is in the wrong position, the cell turns yellow.
                Correct phonemes in the correct position are shown in green.
                The activity also provides Delete and Restart controls, with
                Restart keeping the same target word.
              </p>

              <p>
                The Word Search builder works in a similar way. You can change
                the number of phonemes used in the Word Search, and the
                available words update automatically. You can also change the
                number of rows and columns. For example, you can use a
                six-row by six-column grid and select Regenerate Preview to
                build a new puzzle. You can then generate the standalone HTML
                file.
              </p>

              <p>
                The preview includes a Show Answers option. To find a word, you
                can select the first and last cells or drag across the word.
                The word list is displayed underneath the grid.
              </p>

              <p>
                The Word Search can also be used with the keyboard. You can use
                Tab to navigate to the grid, the arrow keys to move between
                cells, and Enter or Space to select the first and last cells of
                a word.
              </p>

              <p>
                Finally, the Settings page allows you to change between light
                and dark mode and adjust the layout. These preferences are
                saved, so they remain selected when you navigate away and
                return to the website. Thank you for watching.
              </p>
            </div>
          </details>
        </div>
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
              Create a playable phoneme-based guessing activity using one
              selected word, a six-row game grid and a phoneme keyboard.
            </p>
            <Link href="/wordle">Open Wordle Builder</Link>
          </article>

          <article className="activity-card">
            <p className="activity-card__number">02</p>
            <h3>Word Search Builder</h3>
            <p>
              Create a phoneme word search from a small word list and export it
              as a standalone interactive browser activity.
            </p>
            <Link href="/word-search">Open Word Search Builder</Link>
          </article>

          <article className="activity-card">
            <p className="activity-card__number">03</p>
            <h3>Teacher Library</h3>
            <p>
              Enter and manage word lists, multi-character phonemes, hints and
              difficulty metadata stored in PostgreSQL.
            </p>
            <Link href="/library">Open Teacher Library</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
