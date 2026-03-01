import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/database";
import { Button } from "@/components";

export default function SetupCompleteScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleContinue = async () => {
    try {
      await updateProfile(user!.id, { onboarding_complete: true });
      router.replace("/(tabs)");
    } catch (err) {
      // Still navigate even if the update fails
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {/* Success icon */}
        <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-success-50">
          <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
        </View>

        <Text className="text-3xl font-bold text-neutral-900">
          You're All Set!
        </Text>
        <Text className="mt-3 text-center text-base text-neutral-500">
          Your DynaBank account is ready to use.{"\n"}Start banking smarter
          today.
        </Text>

        {/* Feature highlights */}
        <View className="mt-8 w-full space-y-3">
          <QuickInfo icon="wallet-outline" text="Your accounts are ready" />
          <QuickInfo
            icon="shield-checkmark-outline"
            text="PIN protection enabled"
          />
          <QuickInfo
            icon="swap-horizontal-outline"
            text="Transfers & payments unlocked"
          />
        </View>
      </View>

      <View className="px-8 pb-4">
        <Button title="Start Banking" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

function QuickInfo({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center py-1">
      <Ionicons name={icon} size={20} color="#22C55E" />
      <Text className="ml-3 text-base text-neutral-700">{text}</Text>
    </View>
  );
}

