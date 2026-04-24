import ForgotPasswordContent from "./forgot-password-content";

export default async function ForgotPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <ForgotPasswordContent prefilledEmail={resolvedSearchParams?.email || ""} />;
}
