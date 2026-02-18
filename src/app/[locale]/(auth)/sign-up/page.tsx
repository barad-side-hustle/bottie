import { SignUpForm } from "@/components/auth/SignUpForm";

export const dynamic = "force-dynamic";

export default async function SignUpPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;

  return <SignUpForm />;
}
