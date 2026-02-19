import { Loading } from "@/components/ui/loading";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-soft)" }}>
      <Loading />
    </div>
  );
}
