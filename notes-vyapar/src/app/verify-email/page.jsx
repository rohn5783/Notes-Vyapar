import Link from "next/link";

import { verifyEmail } from "@/application/services/auth.service";
import connectDB from "@/infrastructure/database/mongodb";

export default async function VerifyEmailPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token || "";

  let status = "error";
  let message = "Verification token is required.";
  let email = "";

  if (token) {
    try {
      await connectDB();
      const result = await verifyEmail(token);
      status = "success";
      message = result.message || "Email verified successfully.";
      email = result.user?.email || "";
    } catch (error) {
      status = "error";
      message = error.message || "Email verification failed.";
    }
  }

  const loginHref = email
    ? `/login?verified=${status === "success" ? "1" : "0"}&email=${encodeURIComponent(email)}`
    : "/login";

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Email Verification</h1>
        <p style={styles.message}>{message}</p>
        <Link href={loginHref} style={styles.link}>
          Go to Login
        </Link>
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
  },
  link: {
    display: "inline-block",
    marginTop: "16px",
    color: "#1d4ed8",
    fontWeight: 700,
    textDecoration: "none"
  }
};
