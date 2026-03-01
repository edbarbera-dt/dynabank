import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getCards,
  updateCardLimit,
  updateCardStatus,
  type Card,
} from "@/lib/database";
import { CreditCard, LoadingSpinner, Button } from "@/components";

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyLimit, setDailyLimit] = useState("");
  const [savingLimit, setSavingLimit] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCards(id)
      .then((cards) => {
        // getCards returns cards for an account; we need to find by card ID
        // Use a direct approach instead
        const found = cards.find((c) => c.id === id);
        setCard(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Since getCards expects account_id, let's use a workaround
  useEffect(() => {
    if (!id) return;
    // Fetch card by iterating - in production you'd have a getCard(id) function
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("cards")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (data) {
            setCard(data as Card);
            setDailyLimit(data.daily_limit?.toString() || "1000");
          }
          setLoading(false);
        });
    });
  }, [id]);

  const handleSaveLimit = async () => {
    if (!card) return;
    const limit = parseFloat(dailyLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Invalid Limit", "Please enter a valid amount.");
      return;
    }

    setSavingLimit(true);
    try {
      await updateCardLimit(card.id, limit);
      setCard({ ...card, daily_limit: limit });
      Alert.alert("Success", "Daily limit updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update limit.");
    } finally {
      setSavingLimit(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!card) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-neutral-500">Card not found</Text>
      </SafeAreaView>
    );
  }

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
            Card Settings
          </Text>
        </View>

        {/* Card Preview */}
        <View className="mt-4 px-6">
          <CreditCard card={card} />
        </View>

        {/* Card Details */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-neutral-900">
            Card Information
          </Text>
          <View className="rounded-2xl bg-neutral-50 p-4">
            <DetailRow
              label="Card Type"
              value={card.card_type === "virtual" ? "Virtual" : "Physical"}
            />
            <DetailRow
              label="Card Number"
              value={`•••• •••• •••• ${card.card_number.slice(-4)}`}
            />
            <DetailRow label="Expiry" value={card.expiry_date} />
            <DetailRow label="CVV" value={card.cvv} />
            <DetailRow
              label="Status"
              value={card.status.charAt(0).toUpperCase() + card.status.slice(1)}
              isLast
            />
          </View>
        </View>

        {/* Daily Limit */}
        {card.status !== "cancelled" && (
          <View className="mt-6 px-6">
            <Text className="mb-3 text-lg font-semibold text-neutral-900">
              Daily Spending Limit
            </Text>
            <View className="rounded-2xl bg-neutral-50 p-4">
              <View className="flex-row items-center rounded-xl border border-neutral-200 bg-white px-4 py-3">
                <Text className="mr-2 text-xl font-bold text-neutral-900">
                  £
                </Text>
                <TextInput
                  className="flex-1 text-xl font-bold text-neutral-900"
                  value={dailyLimit}
                  onChangeText={setDailyLimit}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#CBD5E1"
                />
              </View>
              <View className="mt-3">
                <Button
                  title="Update Limit"
                  size="sm"
                  onPress={handleSaveLimit}
                  loading={savingLimit}
                />
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
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

