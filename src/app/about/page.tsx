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
            Assessment 1 is frontend only. This stage focuses on interface
            design, usability, accessibility, responsive behaviour and
            downloadable browser-based activity outputs.
          </p>
          <p>
            Database support and dynamic word-list management are outside the
            current task and can be introduced in later development without
            changing the core activity workflow.
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
          </dl>
        </aside>
      </section>

      <section aria-labelledby="about-video-heading" className="section">
        <div className="section-heading">
          <p className="eyebrow">Website guide</p>
          <h2 id="about-video-heading">How to use the builder</h2>
          <p>
            The short guide demonstrates choosing an activity, configuring its
            phonemes, previewing the result and generating the standalone HTML
            activity.
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
                Welcome to the Phoneme Activity Builder. Use the main
                navigation to open the Wordle Builder or Word Search Builder.
                In Wordle, choose a three, four or five phoneme target, select a
                word and review the live preview. Select Generate HTML to
                download a standalone activity. Open the downloaded file in a
                browser, build guesses with the phoneme keyboard and submit an
                answer to receive position feedback and the English word.
              </p>
              <p>
                In Word Search, choose the phoneme count, select a small word
                list, set the grid dimensions and regenerate the preview. Find
                words by dragging across the grid or by activating the first
                and last cells with a keyboard. Select Generate HTML to download
                the independent activity. The Settings page changes the colour
                theme and content width, and saves those preferences in a
                browser cookie.
              </p>
            </div>
          </details>

          <p className="form-help">
            Record the guide using the transcript above, then save it as
            <code> public/phoneme-activity-builder-guide.mp4</code> before
            submission so the transcript accurately matches the audio.
          </p>
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
        </div>
      </section>
    </main>
  );
}
