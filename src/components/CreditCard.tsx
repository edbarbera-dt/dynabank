import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Card } from "@/lib/database";

interface CreditCardProps {
  card: Card;
}

export function CreditCard({ card }: CreditCardProps) {
  const isFrozen = card.status === "frozen";
  const isCancelled = card.status === "cancelled";

  const gradientColors: [string, string, string] = isFrozen
    ? ["#64748B", "#475569", "#334155"]
    : isCancelled
      ? ["#6B7280", "#4B5563", "#374151"]
      : card.card_type === "visa"
        ? ["#1E293B", "#0F172A", "#020617"]
        : ["#7C3AED", "#5B21B6", "#4C1D95"];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="aspect-[1.6] w-full rounded-2xl p-6"
    >
      <View className="flex-1 justify-between">
        {/* Top row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium uppercase tracking-wider text-white/60">
            {card.card_type}
          </Text>
          {isFrozen && (
            <View className="flex-row items-center rounded-full bg-white/20 px-2 py-1">
              <Ionicons name="snow-outline" size={12} color="white" />
              <Text className="ml-1 text-xs font-medium text-white">
                Frozen
              </Text>
            </View>
          )}
          {isCancelled && (
            <View className="flex-row items-center rounded-full bg-red-500/30 px-2 py-1">
              <Ionicons name="close-circle-outline" size={12} color="white" />
              <Text className="ml-1 text-xs font-medium text-white">
                Cancelled
              </Text>
            </View>
          )}
        </View>

        {/* Card number */}
        <Text className="text-lg font-medium tracking-widest text-white">
          {card.card_number}
        </Text>

        {/* Bottom row */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-xs text-white/50">Card Holder</Text>
            <Text className="text-sm font-medium text-white">
              {card.card_holder_name}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-white/50">Expires</Text>
            <Text className="text-sm font-medium text-white">
              {card.expiry_date}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

