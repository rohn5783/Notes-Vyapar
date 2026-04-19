import Link from "next/link";
import ThemeToggle from "@/presentation/components/ui/ThemeToggle";
import { MotionLink } from "@/presentation/components/ui/MotionElements";

import styles from "./page.module.scss";

const FEATURED_NOTES = [
  {
    title: "Quantum Mechanics Foundations",
    category: "Physics",
    description: "Curated concept maps and derivation-led revision notes for foundational mechanics.",
    price: "$24.00",
    accent: "cosmic"
  },
  {
    title: "Advanced Neuroanatomy",
    category: "Medicine",
    description: "High-yield visual breakdowns with clinical context and practical recall prompts.",
    price: "$45.00",
    accent: "clinical"
  },
  {
    title: "Data Structures & Algos",
    category: "Computer Science",
    description: "Well-structured notes with pseudocode, patterns, and interview-focused summaries.",
    price: "$19.99",
    accent: "code"
  }
];

const SEARCH_TAGS = ["Computer Science", "Medicine", "Filters"];

const SELLING_POINTS = [
  "85% royalty on all sales",
  "Automated digital rights management",
  "Instant worldwide distribution"
];

export default function HomePage() {
  return (
    <main className={styles.homePage}>
      <div className={styles.glowOrbLeft} aria-hidden="true" />
      <div className={styles.glowOrbRight} aria-hidden="true" />

      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          Notes Vyapar
        </Link>

        <nav className={styles.primaryNav} aria-label="Primary navigation">
          <Link href="/notes">Marketplace</Link>
          <Link href="/register">Upload</Link>
          <Link href="/login">Library</Link>
        </nav>

        <div className={styles.authLinks}>
          <ThemeToggle />
          <MotionLink href="/login" className={styles.loginLink}>
            Log In
          </MotionLink>
          <MotionLink href="/register" className={styles.signupButton}>
            Sign Up
          </MotionLink>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.eyebrow}>New premium medical notes 2026</div>
        <h1>
          Buy &amp; Sell Notes
          <span> Easily.</span>
        </h1>
        <p>
          Access a curated sanctuary of high-quality student resources. Elevate your learning with
          verified, peer-reviewed artifacts from top global institutions.
        </p>

        <div className={styles.heroActions}>
          <MotionLink href="/notes" className={styles.primaryCta}>
            Explore Notes
          </MotionLink>
          <MotionLink href="/register" className={styles.secondaryCta}>
            Upload Yours
          </MotionLink>
        </div>
      </section>

      <section className={styles.searchBarSection}>
        <div className={styles.searchShell}>
          <span className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchPlaceholder}>
            Search by subject, professor, or university...
          </span>
          <div className={styles.searchTags}>
            {SEARCH_TAGS.map((tag) => (
              <span key={tag} className={styles.searchTag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>The Artifacts</h2>
            <p>Recently curated high-yield study materials.</p>
          </div>
          <Link href="/notes">View Entire Archive</Link>
        </div>

        <div className={styles.notesGrid}>
          {FEATURED_NOTES.map((note) => (
            <article key={note.title} className={styles.noteCard}>
              <div className={`${styles.notePreview} ${styles[`preview${note.accent}`]}`}>
                <span className={styles.previewBadge}>{note.category}</span>
              </div>

              <div className={styles.noteMeta}>
                <span>{note.category}</span>
                <span>4.8</span>
              </div>

              <h3>{note.title}</h3>
              <p>{note.description}</p>

              <div className={styles.noteFooter}>
                <strong>{note.price}</strong>
                <MotionLink href="/login" className={styles.cardAction} aria-label={`Open ${note.title}`}>
                  +
                </MotionLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sellerSection}>
        <div className={styles.sellerContent}>
          <div>
            <h2>
              Your Knowledge is
              <span> Valuable.</span>
            </h2>
            <p>
              Join over 50,000 students who monetize their academic excellence. Publish the notes
              you submit, protect, and profit from your hard work.
            </p>
          </div>

          <ul className={styles.sellingPoints}>
            {SELLING_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <MotionLink href="/register" className={styles.sellerButton}>
            Start Selling Today
          </MotionLink>
        </div>

        <div className={styles.dashboardMock}>
          <div className={styles.dashboardMockInner}>
            <div className={styles.mockToolbar} />
            <div className={styles.mockGrid}>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>Success Dashboard</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>Notes Vyapar</strong>
          <p>Premium study material marketplace.</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/notes">Marketplace</Link>
          <Link href="/login">Log In</Link>
          <Link href="/register">Sign Up</Link>
        </div>
      </footer>
    </main>
  );
}
