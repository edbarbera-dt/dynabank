import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Input } from "@/components";

export default function EnterPhoneScreen() {
  const router = useRouter();
  const { accountType, country } = useLocalSearchParams<{
    accountType: string;
    country: string;
  }>();
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    router.push({
      pathname: "/(onboarding)/create-pin",
      params: { accountType, country, phone },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-50"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-neutral-900">
            Phone Number
          </Text>
          <Text className="mt-2 text-base text-neutral-500">
            We'll use this to verify your identity
          </Text>

          <View className="mt-8">
            <Input
              label="Phone Number"
              placeholder="07700 900000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Text className="text-base text-neutral-500">+44</Text>}
            />
          </View>
        </View>

        <View className="px-6 pb-4">
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={phone.length < 6}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

