import AuthForm from "@/presentation/components/auth/auth-form";

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  return (
    <AuthForm
      mode="login"
      registered={resolvedSearchParams?.registered || ""}
      prefilledEmail={resolvedSearchParams?.email || ""}
      loggedOut={resolvedSearchParams?.loggedOut || ""}
    />
  );
}
