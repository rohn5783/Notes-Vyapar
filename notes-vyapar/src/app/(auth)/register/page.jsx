import AuthForm from "@/presentation/components/auth/auth-form";

export default async function RegisterPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return <AuthForm mode="register" prefilledEmail={resolvedSearchParams?.email || ""} />;
}
