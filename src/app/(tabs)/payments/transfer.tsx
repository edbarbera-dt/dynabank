import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import {
  getAccounts,
  getBeneficiaries,
  transferMoney,
  transferToExternal,
  type Account,
  type Beneficiary,
} from "@/lib/database";
import { Button, LoadingSpinner } from "@/components";

export default function TransferScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [accts, bens] = await Promise.all([
        getAccounts(user.id),
        getBeneficiaries(user.id),
      ]);
      setAccounts(accts);
      setBeneficiaries(bens);
      const primary = accts.find((a) => a.is_primary);
      if (primary) setFromAccount(primary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTransfer = async () => {
    if (!fromAccount || !amount || !selectedBeneficiary) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (numAmount > fromAccount.balance) {
      Alert.alert("Insufficient Funds", "You don't have enough balance.");
      return;
    }

    setSending(true);
    try {
      // Check if beneficiary is an internal account
      const targetAccount = accounts.find(
        (a) =>
          a.account_number === selectedBeneficiary.account_number &&
          a.id !== fromAccount.id,
      );

      if (targetAccount) {
        await transferMoney(
          fromAccount.id,
          targetAccount.id,
          numAmount,
          selectedBeneficiary.name,
        );
      } else {
        await transferToExternal(
          fromAccount.id,
          numAmount,
          selectedBeneficiary.name,
          selectedBeneficiary.account_number,
        );
      }

      router.replace({
        pathname: "/(tabs)/payments/transfer-success",
        params: {
          amount: numAmount.toFixed(2),
          recipient: selectedBeneficiary.name,
        },
      });
    } catch (err: any) {
      Alert.alert("Transfer Failed", err.message || "Please try again.");
    } finally {
      setSending(false);
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
              Send Money
            </Text>
          </View>

          {/* From Account */}
          <View className="mt-4 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              From
            </Text>
            <View className="flex-row gap-2">
              {accounts.map((acct) => (
                <TouchableOpacity
                  key={acct.id}
                  onPress={() => setFromAccount(acct)}
                  className={`flex-1 rounded-xl p-3 ${
                    fromAccount?.id === acct.id
                      ? "border-2 border-primary-500 bg-primary-50"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <Text className="text-xs text-neutral-500">{acct.name}</Text>
                  <Text className="mt-1 text-base font-bold text-neutral-900">
                    £{acct.balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipient */}
          <View className="mt-6 px-6">
            <View className="flex-row items-center justify-between">
              <Text className="mb-2 text-sm font-medium text-neutral-500">
                To
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/payments/add-beneficiary")}
              >
                <Text className="text-sm font-medium text-primary-500">
                  + Add New
                </Text>
              </TouchableOpacity>
            </View>

            {beneficiaries.length === 0 ? (
              <View className="items-center rounded-xl border border-dashed border-neutral-200 py-8">
                <Ionicons name="people-outline" size={32} color="#CBD5E1" />
                <Text className="mt-2 text-sm text-neutral-400">
                  No beneficiaries yet
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push("/(tabs)/payments/add-beneficiary")
                  }
                  className="mt-3"
                >
                  <Text className="text-sm font-medium text-primary-500">
                    Add a beneficiary
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {beneficiaries.map((ben) => (
                  <TouchableOpacity
                    key={ben.id}
                    onPress={() => setSelectedBeneficiary(ben)}
                    className={`w-20 items-center rounded-xl p-3 ${
                      selectedBeneficiary?.id === ben.id
                        ? "border-2 border-primary-500 bg-primary-50"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                      <Text className="text-sm font-bold text-neutral-600">
                        {ben.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Text>
                    </View>
                    <Text
                      className="mt-2 text-xs text-neutral-700"
                      numberOfLines={1}
                    >
                      {ben.name.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Amount */}
          <View className="mt-6 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              Amount
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
                onChangeText={setAmount}
                placeholderTextColor="#CBD5E1"
              />
            </View>
          </View>
        </ScrollView>

        {/* Send Button */}
        <View className="px-6 pb-6">
          <Button
            title="Send Money"
            onPress={handleTransfer}
            loading={sending}
            disabled={!fromAccount || !selectedBeneficiary || !amount}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

