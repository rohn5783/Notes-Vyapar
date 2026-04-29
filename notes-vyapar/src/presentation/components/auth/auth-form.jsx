"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MotionButton } from "@/presentation/components/ui/MotionElements";

import useAuth from "@/presentation/hooks/useAuth";

import styles from "./auth-form.module.css";

const COPY = {
  login: {
    title: "Welcome Back",
    subtitle: "Step back into your archive of verified study notes.",
    cta: "Log In",
    alternateLabel: "New to Notes Vyapar?",
    alternateHref: "/register",
    alternateAction: "Create Account",
    helperText: "Use the verified email linked to your account."
  },
  register: {
    title: "Create Account",
    subtitle: "Join the curated network of learners and note curators.",
    cta: "Sign Up",
    alternateLabel: "Already a curator?",
    alternateHref: "/login",
    alternateAction: "Log In",
    helperText: "Password must contain at least 8 characters and one symbol."
  }
};

const BADGES = ["Secure Entry", "Verified Access", "End-to-End"];

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
const hasStrongPassword = (value) => value.length >= 8 && /[^A-Za-z0-9]/.test(value);

const getInitialState = (mode, email = "") => ({
  name: "",
  email,
  password: ""
});

const validateForm = (mode, values) => {
  if (mode === "register" && values.name.trim().length < 2) {
    return "Please enter your full name.";
  }

  if (!isEmail(values.email.trim())) {
    return "Please enter a valid email address.";
  }

  if (!values.password) {
    return "Password is required.";
  }

  if (mode === "register" && !hasStrongPassword(values.password)) {
    return "Password must be at least 8 characters long and include one symbol.";
  }

  return "";
};

function FieldIcon({ type }) {
  if (type === "name") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.866 0-7 2.015-7 4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5C19 16.015 15.866 14 12 14Z" />
      </svg>
    );
  }

  if (type === "password") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5C6.5 5 2.057 8.387.5 12c1.557 3.613 6 7 11.5 7s9.943-3.387 11.5-7C21.943 8.387 17.5 5 12 5Zm0 11a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm0-6.2A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25Zm2.2.75L12 11.725 17.8 7.5Z" />
      <path d="M6 8.525v8.725c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75V8.525l-5.516 4.024a.85.85 0 0 1-.968 0Z" />
    </svg>
  );
}

export default function AuthForm({
  mode = "login",
  registered = "",
  prefilledEmail = "",
  loggedOut = "",
  verified = "",
  verifyError = ""
}) {
  const copy = COPY[mode] || COPY.login;
  const router = useRouter();
  const { signIn, signUp, status, isAuthenticated } = useAuth();

  const [values, setValues] = useState(() => getInitialState(mode, prefilledEmail));
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";
  const fields = useMemo(
    () =>
      [
        isRegister
          ? {
              key: "name",
              label: "Full Name",
              type: "text",
              autoComplete: "name",
              icon: "name"
            }
          : null,
        {
          key: "email",
          label: "Email Address",
          type: "email",
          autoComplete: "email",
          icon: "email"
        },
        {
          key: "password",
          label: "Password",
          type: showPassword ? "text" : "password",
          autoComplete: isRegister ? "new-password" : "current-password",
          icon: "password"
        }
      ].filter(Boolean),
    [isRegister, showPassword]
  );

  useEffect(() => {
    setValues((currentValues) => ({
      ...currentValues,
      email: currentValues.email || prefilledEmail
    }));
  }, [prefilledEmail]);

  useEffect(() => {
    if (mode === "login" && registered === "1") {
      setFeedback({
        type: "success",
        message: prefilledEmail
          ? `Verification email sent to ${prefilledEmail}. Please verify your account before logging in.`
          : "Verification email sent. Please verify your account before logging in."
      });
    }
  }, [mode, prefilledEmail, registered]);

  useEffect(() => {
    if (mode === "login" && loggedOut === "1") {
      setFeedback({
        type: "success",
        message: "Logout successful. You can log in again whenever you're ready."
      });
    }
  }, [loggedOut, mode]);

  useEffect(() => {
    if (mode === "login" && verified === "1") {
      setFeedback({
        type: "success",
        message: prefilledEmail
          ? `Email verified for ${prefilledEmail}. You can log in now.`
          : "Email verified successfully. You can log in now."
      });
    }
  }, [mode, prefilledEmail, verified]);

  useEffect(() => {
    if (mode === "login" && verifyError) {
      setFeedback({
        type: "error",
        message: verifyError
      });
    }
  }, [mode, verifyError]);

  useEffect(() => {
    if (status === "ready" && isAuthenticated) {
      startTransition(() => {
        router.replace("/dashboard");
      });
    }
  }, [isAuthenticated, router, status]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm(mode, values);
    if (errorMessage) {
      setFeedback({ type: "error", message: errorMessage });
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const result = await signUp({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password
        });

        if (result.emailVerificationSent) {
          setFeedback({
            type: "success",
            message: result.message || "Account created successfully. Please verify your email."
          });

          window.setTimeout(() => {
            startTransition(() => {
              router.push(`/login?registered=1&email=${encodeURIComponent(values.email.trim())}`);
            });
          }, 1400);
        } else {
          setFeedback({
            type: "error",
            message:
              result.message ||
              "Account created, but we could not send the verification email. Please try again."
          });
        }
      } else {
        const result = await signIn({
          email: values.email.trim(),
          password: values.password
        });
 if (result.user) {
  localStorage.setItem("user", JSON.stringify(result.user));
}
        setFeedback({
          type: "success",
          
          message: result.message || "Login successful. Redirecting to your dashboard."
        });

        startTransition(() => {
          router.push("/dashboard");
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to complete your request right now."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.pageShell}>
      <div className={styles.glowOrbLeft} aria-hidden="true" />
      <div className={styles.glowOrbRight} aria-hidden="true" />

      <section className={styles.brandBlock} aria-label="Brand introduction">
        <p className={styles.brandEyebrow}>Notes Vyapar</p>
        <h1 className={styles.brandTitle}>Notes Vyapar</h1>
        <p className={styles.brandSubtitle}>Curating knowledge for the future</p>
      </section>

      <section className={styles.card} aria-label={`${copy.title} form`}>
        <div className={styles.cardHeader}>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.key} className={styles.field}>
              <span>{field.label}</span>
              <div className={styles.inputShell}>
                <input
                  name={field.key}
                  type={field.type}
                  value={values[field.key]}
                  onChange={handleChange}
                  autoComplete={field.autoComplete}
                  placeholder={field.label}
                  disabled={isSubmitting || status === "loading"}
                  required
                />
                {field.key === "password" ? (
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <FieldIcon type={field.icon} />
                  </button>
                ) : (
                  <span className={styles.fieldIcon}>
                    <FieldIcon type={field.icon} />
                  </span>
                )}
              </div>
            </label>
          ))}

          {mode === "login" ? (
            <div className={styles.forgotPasswordRow}>
              <Link href={`/forgot-password?email=${encodeURIComponent(values.email.trim())}`}>
                Forgot password or need a new verification link?
              </Link>
            </div>
          ) : null}

          <div className={styles.helperRow}>
            <span className={styles.helperDot} aria-hidden="true" />
            <p>{copy.helperText}</p>
          </div>

          {feedback ? (
            <div
              className={feedback.type === "error" ? styles.errorMessage : styles.successMessage}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </div>
          ) : null}

          <MotionButton
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || status === "loading"}
          >
            {isSubmitting ? "Please wait..." : copy.cta}
          </MotionButton>
        </form>

        <div className={styles.cardFooter}>
          <p>{copy.alternateLabel}</p>
          <Link href={copy.alternateHref}>{copy.alternateAction}</Link>
        </div>
      </section>

      <footer className={styles.footerMeta}>
        <div className={styles.badges}>
          {BADGES.map((badge) => (
            <span key={badge} className={styles.badge}>
              {badge}
            </span>
          ))}
        </div>
        <div className={styles.footerLinks}>
          <span>&copy; 2026 Notes Vyapar</span>
          {/* <Link href="/notes">Marketplace</Link> */}
          {/* <Link href="/verify-email">Verify Email</Link> */}
        </div>
      </footer>
    </main>
  );
}
