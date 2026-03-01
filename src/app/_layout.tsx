import "../../global.css";
import React, { useEffect, useRef } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components";
import { View } from "react-native";
import {
  Dynatrace,
  DataCollectionLevel,
  UserPrivacyOptions,
  ConfigurationBuilder,
  LogLevel,
} from "@dynatrace/react-native-plugin";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasInitializedDynatrace = useRef(false);

  useEffect(() => {
    if (hasInitializedDynatrace.current) return;
    hasInitializedDynatrace.current = true;

    const initializeDynatrace = async () => {
      const configurationBuilder = new ConfigurationBuilder(
        "https://bf52479mwb.bf-sprint.dynatracelabs.com/mbeacon",
        "ab242b75-ce74-49f3-b4b4-45a5acdf042d",
      );

      configurationBuilder
        .withCrashReporting(true)
        .withErrorHandler(true)
        .withReportFatalErrorAsCrash(true)
        .withLogLevel(LogLevel.Info)
        .withLifecycleUpdate(false)
        .withUserOptIn(false)
        .withActionNamePrivacy(false);

      await Dynatrace.start(configurationBuilder.buildConfiguration());

      const privacyConfig = new UserPrivacyOptions(
        DataCollectionLevel.UserBehavior,
        true,
      );
      Dynatrace.applyUserPrivacyOptions(privacyConfig);
    };

    void initializeDynatrace();
  }, []);

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

