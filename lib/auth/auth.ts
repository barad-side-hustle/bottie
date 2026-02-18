"use client";

import { authClient } from "@/lib/auth-client";
import { useOnboardingStatusStore } from "@/lib/store/onboarding-status-store";

export async function signOut() {
  try {
    await authClient.signOut();

    useOnboardingStatusStore.getState().clearStatus();

    return { error: null, sessionDeletionFailed: false };
  } catch (error) {
    console.error("Sign out error:", error);
    return { error: "auth.errors.signOutFailed", sessionDeletionFailed: true };
  }
}
