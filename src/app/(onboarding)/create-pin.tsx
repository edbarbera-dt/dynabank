import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PinInput } from "@/components";

export default function CreatePinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    accountType: string;
    country: string;
    phone: string;
  }>();

  const handleComplete = (pin: string) => {
    router.push({
      pathname: "/(onboarding)/confirm-pin",
      params: { ...params, pin },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-50"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-neutral-900">
          Create a PIN
        </Text>
        <Text className="mt-2 text-base text-neutral-500">
          You'll use this PIN to access your account and confirm transactions
        </Text>

        <View className="mt-12 items-center">
          <PinInput
            length={6}
            onComplete={handleComplete}
            label="Enter a 6-digit PIN"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

