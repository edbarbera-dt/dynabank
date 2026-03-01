import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/database";
import { PinInput } from "@/components";

export default function ConfirmPinScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    accountType: string;
    country: string;
    phone: string;
    pin: string;
  }>();
  const [error, setError] = useState<string | undefined>();

  const handleComplete = async (confirmPin: string) => {
    if (confirmPin !== params.pin) {
      setError("PINs don't match. Please try again.");
      return;
    }

    try {
      // Hash the PIN
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        confirmPin,
      );

      // Update profile
      await updateProfile(user!.id, {
        pin_hash: pinHash,
        account_type: params.accountType as "personal" | "business",
        country: params.country,
        phone: params.phone,
      });

      router.push("/(onboarding)/setup-complete");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    }
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

        <Text className="text-3xl font-bold text-neutral-900">Confirm PIN</Text>
        <Text className="mt-2 text-base text-neutral-500">
          Re-enter your 6-digit PIN to confirm
        </Text>

        <View className="mt-12 items-center">
          <PinInput
            length={6}
            onComplete={handleComplete}
            error={error}
            label="Confirm your PIN"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

