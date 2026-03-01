import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getUserCards, updateCardStatus, type Card } from "@/lib/database";
import { CreditCard, LoadingSpinner, EmptyState, Button } from "@/components";

export default function CardsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserCards(user.id);
      setCards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleFreeze = async (card: Card) => {
    const newStatus = card.status === "frozen" ? "active" : "frozen";
    try {
      await updateCardStatus(card.id, newStatus);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: newStatus } : c)),
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update card.");
    }
  };

  const handleCancel = (card: Card) => {
    Alert.alert(
      "Cancel Card",
      "Are you sure you want to cancel this card? This action cannot be undone.",
      [
        { text: "Keep Card", style: "cancel" },
        {
          text: "Cancel Card",
          style: "destructive",
          onPress: async () => {
            try {
              await updateCardStatus(card.id, "cancelled");
              setCards((prev) =>
                prev.map((c) =>
                  c.id === card.id ? { ...c, status: "cancelled" } : c,
                ),
              );
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchCards();
            }}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-neutral-900">My Cards</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cards/create-card")}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-50"
          >
            <Ionicons name="add" size={24} color="#1A73E8" />
          </TouchableOpacity>
        </View>

        {cards.length === 0 ? (
          <View className="mt-12 px-6">
            <EmptyState
              icon="card-outline"
              title="No Cards Yet"
              description="Create a virtual card to get started"
            />
            <View className="mt-6">
              <Button
                title="Create Card"
                onPress={() => router.push("/(tabs)/cards/create-card")}
              />
            </View>
          </View>
        ) : (
          <View className="px-6 pt-4">
            {cards.map((card) => (
              <View key={card.id} className="mb-6">
                <CreditCard card={card} />

                {/* Card Actions */}
                {card.status !== "cancelled" && (
                  <View className="mt-3 flex-row justify-center gap-4">
                    <TouchableOpacity
                      className="flex-row items-center rounded-xl bg-neutral-50 px-4 py-2.5"
                      onPress={() => handleFreeze(card)}
                    >
                      <Ionicons
                        name={
                          card.status === "frozen"
                            ? "sunny-outline"
                            : "snow-outline"
                        }
                        size={18}
                        color={card.status === "frozen" ? "#22C55E" : "#6366F1"}
                      />
                      <Text className="ml-2 text-sm font-medium text-neutral-700">
                        {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center rounded-xl bg-neutral-50 px-4 py-2.5"
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/cards/card-details",
                          params: { id: card.id },
                        })
                      }
                    >
                      <Ionicons
                        name="settings-outline"
                        size={18}
                        color="#64748B"
                      />
                      <Text className="ml-2 text-sm font-medium text-neutral-700">
                        Settings
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center rounded-xl bg-neutral-50 px-4 py-2.5"
                      onPress={() => handleCancel(card)}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color="#EF4444"
                      />
                      <Text className="ml-2 text-sm font-medium text-danger-500">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {card.status === "cancelled" && (
                  <View className="mt-3 items-center rounded-xl bg-danger-50 py-2">
                    <Text className="text-sm font-medium text-danger-500">
                      This card has been cancelled
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

