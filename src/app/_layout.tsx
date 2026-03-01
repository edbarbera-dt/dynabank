import "../../global.css";
import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components";
import { View } from "react-native";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Not signed in → redirect to welcome
      router.replace("/(auth)/welcome");
    } else if (user && inAuthGroup) {
      // Signed in but on auth screen → redirect to main app
      // The onboarding check happens inside (tabs) layout
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

