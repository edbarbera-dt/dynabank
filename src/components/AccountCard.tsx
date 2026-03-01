import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Account } from "@/lib/database";

interface AccountCardProps {
  account: Account;
  compact?: boolean;
}

export function AccountCard({ account, compact = false }: AccountCardProps) {
  return (
    <LinearGradient
      colors={["#1A73E8", "#0C5DC7", "#0A4BA2"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={compact ? "rounded-xl p-4" : "rounded-2xl p-6"}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-white/80">
          {account.name}
        </Text>
        <Text className="text-xs font-medium text-white/60">
          {account.currency}
        </Text>
      </View>

      <Text
        className={
          compact
            ? "mt-2 text-2xl font-bold text-white"
            : "mt-4 text-4xl font-bold text-white"
        }
      >
        £
        {Number(account.balance).toLocaleString("en-GB", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>

      {!compact && (
        <View className="mt-4 flex-row justify-between">
          <View>
            <Text className="text-xs text-white/60">Account Number</Text>
            <Text className="text-sm font-medium text-white/90">
              {account.account_number}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-white/60">Sort Code</Text>
            <Text className="text-sm font-medium text-white/90">
              {account.sort_code}
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

