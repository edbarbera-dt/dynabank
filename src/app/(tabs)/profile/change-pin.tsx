import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from "expo-crypto";
import { useAuth } from "@/lib/auth";
import { updateProfile } from "@/lib/database";
import { Button, PinInput } from "@/components";

type Step = "current" | "new" | "confirm";

export default function ChangePinScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCurrentPinComplete = (pin: string) => {
    setCurrentPin(pin);
    setStep("new");
  };

  const handleNewPinComplete = (pin: string) => {
    setNewPin(pin);
    setStep("confirm");
  };

  const handleConfirmPinComplete = async (pin: string) => {
    setConfirmPin(pin);

    if (pin !== newPin) {
      Alert.alert("PINs Don't Match", "Please try again.", [
        {
          text: "OK",
          onPress: () => {
            setNewPin("");
            setConfirmPin("");
            setStep("new");
          },
        },
      ]);
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin,
      );
      await updateProfile(user.id, { pin_hash: pinHash });
      Alert.alert("Success", "Your PIN has been changed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to change PIN.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">
            Change PIN
          </Text>
        </View>

        <View className="mt-12 items-center px-6">
          <View className="mb-6 h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <Ionicons name="keypad" size={32} color="#1A73E8" />
          </View>

          {step === "current" && (
            <>
              <Text className="text-xl font-bold text-neutral-900">
                Enter Current PIN
              </Text>
              <Text className="mt-2 text-center text-sm text-neutral-500">
                Enter your current 6-digit PIN to continue
              </Text>
              <View className="mt-8">
                <PinInput
                  length={6}
                  value={currentPin}
                  onComplete={handleCurrentPinComplete}
                />
              </View>
            </>
          )}

          {step === "new" && (
            <>
              <Text className="text-xl font-bold text-neutral-900">
                Create New PIN
              </Text>
              <Text className="mt-2 text-center text-sm text-neutral-500">
                Choose a new 6-digit PIN
              </Text>
              <View className="mt-8">
                <PinInput
                  length={6}
                  value={newPin}
                  onComplete={handleNewPinComplete}
                />
              </View>
            </>
          )}

          {step === "confirm" && (
            <>
              <Text className="text-xl font-bold text-neutral-900">
                Confirm New PIN
              </Text>
              <Text className="mt-2 text-center text-sm text-neutral-500">
                Re-enter your new PIN to confirm
              </Text>
              <View className="mt-8">
                <PinInput
                  length={6}
                  value={confirmPin}
                  onComplete={handleConfirmPinComplete}
                />
              </View>
              {saving && (
                <Text className="mt-4 text-sm text-neutral-400">Saving...</Text>
              )}
            </>
          )}

          {/* Step indicator */}
          <View className="mt-8 flex-row gap-2">
            {(["current", "new", "confirm"] as Step[]).map((s, i) => (
              <View
                key={s}
                className={`h-2 w-8 rounded-full ${
                  i <= ["current", "new", "confirm"].indexOf(step)
                    ? "bg-primary-500"
                    : "bg-neutral-200"
                }`}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

