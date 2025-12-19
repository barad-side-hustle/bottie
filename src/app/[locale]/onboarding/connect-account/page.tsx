import { ConnectAccountForm } from "@/components/onboarding/ConnectAccountForm";
import { generatePrivatePageMetadata } from "@/lib/seo/private-metadata";

export const metadata = generatePrivatePageMetadata("Onboarding");

export default function ConnectAccountPage() {
  return <ConnectAccountForm />;
}
