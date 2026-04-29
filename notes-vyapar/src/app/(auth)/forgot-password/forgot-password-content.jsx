"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./forgot-password.module.css";

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

const parseResponse = async (response) => {
  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Something went wrong");
  }

  return result;
};

export default function ForgotPasswordContent({ prefilledEmail = "" }) {
  const [email, setEmail] = useState(prefilledEmail);
  const [feedback, setFeedback] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");

  const normalizedEmail = email.trim().toLowerCase();

  const runAction = async ({ action, endpoint }) => {
    if (!isEmail(normalizedEmail)) {
      setFeedback({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    setLoadingAction(action);
    setFeedback(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const result = await parseResponse(response);

      setFeedback({
        type: "success",
        message: result.message || "Request completed successfully."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to process your request right now."
      });
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Account Recovery</p>
        <h1>Forgot password?</h1>
        <p className={styles.subtitle}>
          Enter your email to reset your password. If your account is not verified yet, use resend
          verification.
        </p>

        <label className={styles.field}>
          <span>Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={Boolean(loadingAction)}
          />
        </label>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() =>
            runAction({
              action: "reset",
              endpoint: "/api/auth/forgot-password"
            })
          }
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "reset" ? "Sending reset link..." : "Send reset password link"}
        </button>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() =>
            runAction({
              action: "resend",
              endpoint: "/api/auth/resend-verification"
            })
          }
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "resend" ? "Sending verification..." : "Resend verification link"}
        </button>

        {feedback ? (
          <p
            className={feedback.type === "error" ? styles.errorMessage : styles.successMessage}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}

        <p className={styles.footer}>
          <Link href={`/login?email=${encodeURIComponent(normalizedEmail)}`}>Back to Login</Link>
        </p>
      </section>
    </main>
  );
}

