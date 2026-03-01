import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import {
  getBeneficiaries,
  deleteBeneficiary,
  type Beneficiary,
} from "@/lib/database";
import { LoadingSpinner, EmptyState, Button } from "@/components";

export default function BeneficiariesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBeneficiaries = useCallback(async () => {
    if (!user) return;
    try {
      const bens = await getBeneficiaries(user.id);
      setBeneficiaries(bens);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const handleDelete = (ben: Beneficiary) => {
    Alert.alert(
      "Delete Beneficiary",
      `Are you sure you want to remove ${ben.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBeneficiary(ben.id);
              setBeneficiaries((prev) => prev.filter((b) => b.id !== ben.id));
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete.");
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-neutral-900">
            Beneficiaries
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/payments/add-beneficiary")}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary-50"
        >
          <Ionicons name="add" size={24} color="#1A73E8" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={beneficiaries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBeneficiaries();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center border-b border-neutral-100 py-4"
            activeOpacity={0.7}
            onLongPress={() => handleDelete(item)}
          >
            <View className="h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <Text className="text-base font-bold text-neutral-600">
                {item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-medium text-neutral-900">
                {item.name}
              </Text>
              <Text className="mt-0.5 text-xs text-neutral-400">
                {item.sort_code} • {item.account_number}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No Beneficiaries"
            description="Add a beneficiary to start sending money"
          />
        }
      />
    </SafeAreaView>
  );
}

