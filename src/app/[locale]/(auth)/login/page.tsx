import { LoginForm } from "@/components/auth/LoginForm";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const dynamic = "force-dynamic";

export const metadata = generatePrivatePageMetadata("Login");

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  await params;

  return <LoginForm />;
}
