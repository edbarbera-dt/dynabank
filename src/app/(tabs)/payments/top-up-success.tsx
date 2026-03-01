import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";

export default function TopUpSuccessScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-success-50">
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-neutral-900">
          Top Up Successful!
        </Text>
        <Text className="mt-2 text-center text-base text-neutral-500">
          <Text className="font-semibold text-neutral-900">£{amount}</Text> has
          been added to your account
        </Text>

        <View className="mt-8 w-full gap-3">
          <Button
            title="Done"
            onPress={() => router.replace("/(tabs)/payments")}
          />
          <Button
            title="Top Up More"
            variant="outline"
            onPress={() => router.replace("/(tabs)/payments/top-up")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

