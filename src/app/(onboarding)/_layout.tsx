import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/lib/auth";
import { getProfile } from "@/lib/database";
import { LoadingSpinner } from "@/components";

export default function OnboardingLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkOnboarding() {
      if (!user) {
        router.replace("/(auth)/welcome");
        return;
      }

      const profile = await getProfile(user.id);
      if (profile?.onboarding_complete) {
        router.replace("/(tabs)");
        return;
      }

      setChecking(false);
    }

    checkOnboarding();
  }, [user]);

  if (checking) {
    return <LoadingSpinner />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
        animation: "slide_from_right",
      }}
    />
  );
}

