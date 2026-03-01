import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/utils/cn";
import type { Transaction } from "@/lib/database";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  salary: "cash-outline",
  groceries: "cart-outline",
  transport: "car-outline",
  entertainment: "game-controller-outline",
  bills: "receipt-outline",
  transfer: "swap-horizontal-outline",
  top_up: "add-circle-outline",
  exchange: "globe-outline",
  shopping: "bag-outline",
  dining: "restaurant-outline",
  subscription: "repeat-outline",
  general: "ellipsis-horizontal-outline",
};

const categoryColors: Record<string, string> = {
  salary: "bg-success-50",
  groceries: "bg-orange-50",
  transport: "bg-blue-50",
  entertainment: "bg-purple-50",
  bills: "bg-red-50",
  transfer: "bg-primary-50",
  top_up: "bg-success-50",
  exchange: "bg-indigo-50",
  shopping: "bg-pink-50",
  dining: "bg-amber-50",
  subscription: "bg-violet-50",
  general: "bg-neutral-100",
};

const categoryIconColors: Record<string, string> = {
  salary: "#22C55E",
  groceries: "#F97316",
  transport: "#3B82F6",
  entertainment: "#A855F7",
  bills: "#EF4444",
  transfer: "#1A73E8",
  top_up: "#22C55E",
  exchange: "#6366F1",
  shopping: "#EC4899",
  dining: "#F59E0B",
  subscription: "#8B5CF6",
  general: "#64748B",
};

function formatTransactionDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd MMM yyyy");
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({
  transaction,
  onPress,
}: TransactionItemProps) {
  const icon = categoryIcons[transaction.category] || categoryIcons.general;
  const bgColor =
    categoryColors[transaction.category] || categoryColors.general;
  const iconColor =
    categoryIconColors[transaction.category] || categoryIconColors.general;

  const isCredit = transaction.type === "credit";
  const amountPrefix = isCredit ? "+" : "-";
  const amountColor = isCredit ? "text-success-500" : "text-neutral-900";

  return (
    <TouchableOpacity
      className="flex-row items-center py-3"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View
        className={cn(
          "mr-3 h-10 w-10 items-center justify-center rounded-full",
          bgColor,
        )}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-medium text-neutral-900"
          numberOfLines={1}
        >
          {transaction.description ||
            transaction.counterparty_name ||
            "Transaction"}
        </Text>
        <Text className="text-sm text-neutral-400">
          {formatTransactionDate(transaction.created_at)}
        </Text>
      </View>
      <Text className={cn("text-base font-semibold", amountColor)}>
        {amountPrefix}£{Math.abs(transaction.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

