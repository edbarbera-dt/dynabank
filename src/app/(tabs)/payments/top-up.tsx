import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getAccounts, topUpAccount, type Account } from "@/lib/database";
import { Button, LoadingSpinner } from "@/components";

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function TopUpScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const handleTopUp = async () => {
    if (!selectedAccount) return;
    const numAmount = selectedQuick || parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    setProcessing(true);
    try {
      await topUpAccount(selectedAccount.id, numAmount);
      router.replace({
        pathname: "/(tabs)/payments/top-up-success",
        params: { amount: numAmount.toFixed(2) },
      });
    } catch (err: any) {
      Alert.alert("Top Up Failed", err.message || "Please try again.");
    } finally {
      setProcessing(false);
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
              Top Up
            </Text>
          </View>

          {/* Account Selector */}
          <View className="mt-4 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              Top up to
            </Text>
            <View className="flex-row gap-2">
              {accounts.map((acct) => (
                <TouchableOpacity
                  key={acct.id}
                  onPress={() => setSelectedAccount(acct)}
                  className={`flex-1 rounded-xl p-3 ${
                    selectedAccount?.id === acct.id
                      ? "border-2 border-primary-500 bg-primary-50"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <Text className="text-xs text-neutral-500">
                    {acct.account_name}
                  </Text>
                  <Text className="mt-1 text-base font-bold text-neutral-900">
                    £{acct.balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Amounts */}
          <View className="mt-6 px-6">
            <Text className="mb-3 text-sm font-medium text-neutral-500">
              Quick amount
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {QUICK_AMOUNTS.map((qa) => (
                <TouchableOpacity
                  key={qa}
                  onPress={() => {
                    setSelectedQuick(qa);
                    setAmount("");
                  }}
                  className={`rounded-xl px-5 py-3 ${
                    selectedQuick === qa ? "bg-primary-500" : "bg-neutral-100"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selectedQuick === qa ? "text-white" : "text-neutral-700"
                    }`}
                  >
                    £{qa}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View className="mt-6 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              Or enter custom amount
            </Text>
            <View className="flex-row items-center rounded-xl border border-neutral-200 px-4 py-3">
              <Text className="mr-2 text-2xl font-bold text-neutral-900">
                £
              </Text>
              <TextInput
                className="flex-1 text-2xl font-bold text-neutral-900"
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={(val) => {
                  setAmount(val);
                  setSelectedQuick(null);
                }}
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            title="Top Up"
            onPress={handleTopUp}
            loading={processing}
            disabled={!selectedAccount || (!selectedQuick && !amount)}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

