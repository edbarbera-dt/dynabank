import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

export default function ExchangeConfirmScreen() {
  const router = useRouter();
  const { fromAmount, fromCurrency, toAmount, toCurrency } =
    useLocalSearchParams<{
      fromAmount: string;
      fromCurrency: string;
      toAmount: string;
      toCurrency: string;
    }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-success-50">
          <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-neutral-900">
          Exchange Complete!
        </Text>
        <Text className="mt-3 text-center text-base text-neutral-500">
          You exchanged
        </Text>
        <Text className="mt-1 text-xl font-bold text-neutral-900">
          {CURRENCY_SYMBOLS[fromCurrency || "GBP"]}
          {fromAmount} {fromCurrency}
        </Text>
        <View className="my-2">
          <Ionicons name="arrow-down" size={20} color="#94A3B8" />
        </View>
        <Text className="text-xl font-bold text-success-500">
          {CURRENCY_SYMBOLS[toCurrency || "EUR"]}
          {toAmount} {toCurrency}
        </Text>

        <View className="mt-8 w-full gap-3">
          <Button
            title="Done"
            onPress={() => router.replace("/(tabs)/payments")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

