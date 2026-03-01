import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ACTIONS = [
  {
    icon: "arrow-forward-circle" as const,
    title: "Send Money",
    description: "Transfer to a beneficiary",
    route: "/(tabs)/payments/transfer",
    color: "#1A73E8",
    bg: "#EFF6FF",
  },
  {
    icon: "add-circle" as const,
    title: "Top Up",
    description: "Add money to your account",
    route: "/(tabs)/payments/top-up",
    color: "#22C55E",
    bg: "#F0FDF4",
  },
  {
    icon: "globe" as const,
    title: "Exchange",
    description: "Convert between currencies",
    route: "/(tabs)/payments/exchange",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: "people" as const,
    title: "Beneficiaries",
    description: "Manage saved recipients",
    route: "/(tabs)/payments/beneficiaries",
    color: "#F97316",
    bg: "#FFF7ED",
  },
];

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-neutral-900">Payments</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Send, receive and exchange money
          </Text>
        </View>

        <View className="mt-4 px-6">
          {ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.title}
              className="mb-3 flex-row items-center rounded-2xl bg-neutral-50 p-4"
              activeOpacity={0.7}
              onPress={() => router.push(action.route as any)}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: action.bg }}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-neutral-900">
                  {action.title}
                </Text>
                <Text className="text-sm text-neutral-400">
                  {action.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

