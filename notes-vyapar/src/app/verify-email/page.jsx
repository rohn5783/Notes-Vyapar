import { Suspense } from "react";

import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailFallback() {
  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Email Verification</h1>
        <p style={styles.message}>Preparing your verification...</p>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "24px",
    background: "#f5f7fb"
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "32px",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
    textAlign: "center"
  },
  title: {
    margin: "0 0 12px",
    fontSize: "28px",
    color: "#111827"
  },
  message: {
    margin: 0,
    fontSize: "16px",
    color: "#4b5563",
    lineHeight: 1.6
  }
};
