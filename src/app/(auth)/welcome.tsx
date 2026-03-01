import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <View className="mb-8 h-24 w-24 items-center justify-center rounded-3xl bg-primary-500">
          <Ionicons name="wallet-outline" size={48} color="white" />
        </View>

        {/* Title */}
        <Text className="text-4xl font-bold text-neutral-900">DynaBank</Text>
        <Text className="mt-3 text-center text-lg text-neutral-500">
          Banking made simple.{"\n"}Fast, secure, and always at your fingertips.
        </Text>

        {/* Features */}
        <View className="mt-10 w-full space-y-3">
          <FeatureItem
            icon="shield-checkmark-outline"
            text="Secure transactions with PIN protection"
          />
          <FeatureItem
            icon="flash-outline"
            text="Instant transfers between accounts"
          />
          <FeatureItem
            icon="globe-outline"
            text="Currency exchange at competitive rates"
          />
        </View>
      </View>

      {/* Bottom buttons */}
      <View className="px-8 pb-4">
        <Button
          title="Get Started"
          onPress={() => router.push("/(auth)/sign-up")}
        />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
          className="mt-3"
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center py-1.5">
      <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={16} color="#1A73E8" />
      </View>
      <Text className="flex-1 text-sm text-neutral-600">{text}</Text>
    </View>
  );
}

