import ResetPasswordContent from "./reset-password-content";

export default async function ResetPasswordPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <ResetPasswordContent token={resolvedSearchParams?.token || ""} />;
}

