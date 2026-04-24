"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import styles from "./reset-password.module.scss";

const hasStrongPassword = (value) => value.length >= 8 && /[^A-Za-z0-9]/.test(value);
const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

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

export default function ResetPasswordContent({ token = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedToken = useMemo(() => {
    const fromQuery = searchParams.get("token");
    const candidate = (fromQuery || token || "").trim();
    const decoded = safeDecodeURIComponent(candidate);
    const match = decoded.toLowerCase().match(/[a-f0-9]{64}/);
    return match?.[0] || "";
  }, [searchParams, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!normalizedToken) {
      setFeedback({ type: "error", message: "Reset token is missing. Request a new link." });
      return;
    }

    if (!hasStrongPassword(password)) {
      setFeedback({
        type: "error",
        message: "Password must be at least 8 characters long and include one symbol."
      });
      return;
    }

    if (password !== confirmPassword) {
      setFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: normalizedToken,
          password
        })
      });

      const result = await parseResponse(response);
      setFeedback({
        type: "success",
        message: result.message || "Password has been reset successfully."
      });

      window.setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to reset password right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Secure Access</p>
        <h1>Reset password</h1>
        <p className={styles.subtitle}>Set a new password for your Notes Vyapar account.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>New Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </label>

          <label className={styles.field}>
            <span>Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              disabled={isSubmitting}
            />
          </label>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Updating password..." : "Update Password"}
          </button>
        </form>

        {feedback ? (
          <p
            className={feedback.type === "error" ? styles.errorMessage : styles.successMessage}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        ) : null}

        <p className={styles.footer}>
          <Link href="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}
