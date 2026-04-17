"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is required.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Email verification failed");
        }

        setStatus("success");
        setMessage(result.message || "Email verified successfully");
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Email verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Email Verification</h1>
        <p style={styles.message}>{message}</p>
        {status !== "loading" && (
          <Link href="/login" style={styles.link}>
            Go to Login
          </Link>
        )}
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
    margin: "0 0 20px",
    fontSize: "16px",
    color: "#4b5563",
    lineHeight: 1.6
  },
  link: {
    color: "#0f766e",
    textDecoration: "none",
    fontWeight: 600
  }
};
