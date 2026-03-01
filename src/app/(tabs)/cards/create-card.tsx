import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getAccounts, createCard, type Account } from "@/lib/database";
import { Button, LoadingSpinner, Input } from "@/components";
import { getRandomElement } from "@/lib/utils";

export default function CreateCardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const accts = await getAccounts(user.id);
      setAccounts(accts);
      const primary = accts.find((a) => a.is_primary);
      if (primary) setSelectedAccount(primary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreate = async () => {
    if (!selectedAccount || !user) return;

    setCreating(true);
    try {
      // Generate random card details
      const cardNumber = generateCardNumber();
      const expiry = generateExpiry();
      const cvv = generateCVV();

      await createCard(
        selectedAccount.id,
        selectedAccount.name,
        getRandomElement(["visa", "mastercard"]),
      );

      Alert.alert("Card Created", "Your new virtual card is ready!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create card.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
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
              Create Virtual Card
            </Text>
          </View>

          {/* Card Type Info */}
          <View className="mx-6 mt-6 rounded-2xl bg-primary-50 p-4">
            <View className="flex-row items-center">
              <Ionicons name="card" size={24} color="#1A73E8" />
              <Text className="ml-3 text-base font-semibold text-primary-700">
                Virtual Card
              </Text>
            </View>
            <Text className="mt-2 text-sm text-primary-600">
              Create an instant virtual card for online payments. Use it
              immediately after creation.
            </Text>
          </View>

          {/* Card Name */}
          <View className="mt-6 px-6">
            <Input
              label="Card Name (optional)"
              placeholder="e.g. Shopping, Subscriptions"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>

          {/* Account Selection */}
          <View className="mt-6 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              Link to account
            </Text>
            <View className="gap-2">
              {accounts.map((acct) => (
                <TouchableOpacity
                  key={acct.id}
                  onPress={() => setSelectedAccount(acct)}
                  className={`flex-row items-center justify-between rounded-xl p-4 ${
                    selectedAccount?.id === acct.id
                      ? "border-2 border-primary-500 bg-primary-50"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <View>
                    <Text className="text-base font-medium text-neutral-900">
                      {acct.name}
                    </Text>
                    <Text className="text-sm text-neutral-400">
                      {acct.currency} • £{acct.balance.toFixed(2)}
                    </Text>
                  </View>
                  {selectedAccount?.id === acct.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#1A73E8"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            title="Create Card"
            onPress={handleCreate}
            loading={creating}
            disabled={!selectedAccount}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function generateCardNumber(): string {
  const prefix = "4532";
  let number = prefix;
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

function generateExpiry(): string {
  const now = new Date();
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const year = String(now.getFullYear() + 3).slice(-2);
  return `${month}/${year}`;
}

function generateCVV(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}

