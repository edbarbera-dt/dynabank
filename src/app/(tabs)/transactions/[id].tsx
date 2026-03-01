import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTransaction, type Transaction } from "@/lib/database";
import { LoadingSpinner } from "@/components";
import { format, parseISO } from "date-fns";

const CATEGORY_CONFIG: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  transfer: { icon: "arrow-forward-circle", color: "#1A73E8", bg: "#EFF6FF" },
  top_up: { icon: "add-circle", color: "#22C55E", bg: "#F0FDF4" },
  exchange: { icon: "globe", color: "#8B5CF6", bg: "#F5F3FF" },
  payment: { icon: "cart", color: "#F97316", bg: "#FFF7ED" },
  salary: { icon: "briefcase", color: "#22C55E", bg: "#F0FDF4" },
  subscription: { icon: "repeat", color: "#EF4444", bg: "#FEF2F2" },
  food: { icon: "restaurant", color: "#F97316", bg: "#FFF7ED" },
  transport: { icon: "car", color: "#6366F1", bg: "#EEF2FF" },
  shopping: { icon: "bag-handle", color: "#EC4899", bg: "#FDF2F8" },
  entertainment: { icon: "game-controller", color: "#8B5CF6", bg: "#F5F3FF" },
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getTransaction(id)
        .then(setTransaction)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!transaction) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-500">Transaction not found</Text>
      </SafeAreaView>
    );
  }

  const isCredit = transaction.type === "credit";
  const config =
    CATEGORY_CONFIG[transaction.category] || CATEGORY_CONFIG.payment;
  const date = parseISO(transaction.created_at);
  const amountFormatted = `${isCredit ? "+" : "-"}£${Math.abs(
    transaction.amount,
  ).toFixed(2)}`;

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
            Transaction Details
          </Text>
        </View>

        {/* Amount & Status */}
        <View className="mt-6 items-center px-6">
          <View
            className="mb-4 h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: config.bg }}
          >
            <Ionicons name={config.icon} size={32} color={config.color} />
          </View>

          <Text className="text-sm text-neutral-500 capitalize">
            {transaction.category.replace("_", " ")}
          </Text>

          <Text
            className={`mt-1 text-3xl font-bold ${
              isCredit ? "text-success-500" : "text-neutral-900"
            }`}
          >
            {amountFormatted}
          </Text>

          <View className="mt-3 flex-row items-center rounded-full bg-success-50 px-3 py-1">
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            <Text className="ml-1 text-xs font-medium text-success-600">
              Completed
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="mt-8 px-6">
          <View className="rounded-2xl bg-neutral-50 p-4">
            {transaction.counterparty_name && (
              <DetailRow
                label={isCredit ? "From" : "To"}
                value={transaction.counterparty_name}
              />
            )}
            <DetailRow label="Date" value={format(date, "d MMM yyyy, HH:mm")} />
            <DetailRow label="Type" value={isCredit ? "Credit" : "Debit"} />
            <DetailRow
              label="Category"
              value={
                transaction.category.charAt(0).toUpperCase() +
                transaction.category.slice(1).replace("_", " ")
              }
            />
            {transaction.reference && (
              <DetailRow label="Reference" value={transaction.reference} />
            )}
            {transaction.balance_after !== null &&
              transaction.balance_after !== undefined && (
                <DetailRow
                  label="Balance After"
                  value={`£${transaction.balance_after.toFixed(2)}`}
                  isLast
                />
              )}
          </View>
        </View>

        {/* Transaction ID */}
        <View className="mt-6 px-6 pb-8">
          <Text className="text-center text-xs text-neutral-300">
            Transaction ID: {transaction.id}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        !isLast ? "border-b border-neutral-100" : ""
      }`}
    >
      <Text className="text-sm text-neutral-400">{label}</Text>
      <Text className="text-sm font-medium text-neutral-900">{value}</Text>
    </View>
  );
}

