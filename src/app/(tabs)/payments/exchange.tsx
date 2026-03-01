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
import {
  getAccounts,
  getExchangeRates,
  exchangeMoney,
  type Account,
  type ExchangeRate,
} from "@/lib/database";
import { Button, LoadingSpinner } from "@/components";

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

export default function ExchangeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [accts, rateData] = await Promise.all([
        getAccounts(user.id),
        getExchangeRates(),
      ]);
      setAccounts(accts);
      setRates(rateData);

      if (accts.length >= 2) {
        setFromAccount(accts[0]);
        setToAccount(accts[1]);
      } else if (accts.length === 1) {
        setFromAccount(accts[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (fromAccount && toAccount && amount) {
      const rate = findRate(rates, fromAccount.currency, toAccount.currency);
      if (rate) {
        const converted = parseFloat(amount) * rate.rate;
        setConvertedAmount(converted.toFixed(2));
      } else {
        setConvertedAmount(null);
      }
    } else {
      setConvertedAmount(null);
    }
  }, [amount, fromAccount, toAccount, rates]);

  const findRate = (
    rates: ExchangeRate[],
    from: string,
    to: string,
  ): ExchangeRate | null => {
    if (from === to)
      return {
        id: "",
        from_currency: from,
        to_currency: to,
        rate: 1,
        updated_at: "",
      };
    return (
      rates.find((r) => r.from_currency === from && r.to_currency === to) ||
      null
    );
  };

  const handleExchange = async () => {
    if (!fromAccount || !toAccount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (numAmount > fromAccount.balance) {
      Alert.alert("Insufficient Funds", "You don't have enough balance.");
      return;
    }

    setProcessing(true);
    try {
      await exchangeMoney(
        fromAccount.id,
        toAccount.id,
        numAmount,
        fromAccount.currency,
        toAccount.currency,
      );
      router.replace({
        pathname: "/(tabs)/payments/exchange-confirm",
        params: {
          fromAmount: numAmount.toFixed(2),
          fromCurrency: fromAccount.currency,
          toAmount: convertedAmount || "0",
          toCurrency: toAccount.currency,
        },
      });
    } catch (err: any) {
      Alert.alert("Exchange Failed", err.message || "Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const currentRate =
    fromAccount && toAccount
      ? findRate(rates, fromAccount.currency, toAccount.currency)
      : null;

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
              Exchange
            </Text>
          </View>

          {/* Exchange Rate */}
          {currentRate && fromAccount && toAccount && (
            <View className="mx-6 mt-4 rounded-xl bg-primary-50 p-4">
              <View className="flex-row items-center">
                <Ionicons name="trending-up" size={16} color="#1A73E8" />
                <Text className="ml-2 text-sm font-medium text-primary-600">
                  1 {fromAccount.currency} = {currentRate.rate.toFixed(4)}{" "}
                  {toAccount.currency}
                </Text>
              </View>
            </View>
          )}

          {/* From */}
          <View className="mt-6 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              From
            </Text>
            <View className="flex-row gap-2">
              {accounts.map((acct) => (
                <TouchableOpacity
                  key={acct.id}
                  onPress={() => {
                    setFromAccount(acct);
                    if (toAccount?.id === acct.id) {
                      const other = accounts.find((a) => a.id !== acct.id);
                      setToAccount(other || null);
                    }
                  }}
                  className={`flex-1 rounded-xl p-3 ${
                    fromAccount?.id === acct.id
                      ? "border-2 border-primary-500 bg-primary-50"
                      : "border border-neutral-200 bg-white"
                  }`}
                >
                  <Text className="text-xs text-neutral-500">
                    {acct.name} ({acct.currency})
                  </Text>
                  <Text className="mt-1 text-base font-bold text-neutral-900">
                    {CURRENCY_SYMBOLS[acct.currency] || ""}
                    {acct.balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View className="mt-6 px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              Amount
            </Text>
            <View className="flex-row items-center rounded-xl border border-neutral-200 px-4 py-3">
              <Text className="mr-2 text-2xl font-bold text-neutral-900">
                {CURRENCY_SYMBOLS[fromAccount?.currency || "GBP"]}
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

          {/* Swap */}
          <View className="my-4 items-center">
            <TouchableOpacity
              onPress={() => {
                const temp = fromAccount;
                setFromAccount(toAccount);
                setToAccount(temp);
              }}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary-500"
            >
              <Ionicons name="swap-vertical" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* To */}
          <View className="px-6">
            <Text className="mb-2 text-sm font-medium text-neutral-500">
              To
            </Text>
            <View className="flex-row gap-2">
              {accounts
                .filter((a) => a.id !== fromAccount?.id)
                .map((acct) => (
                  <TouchableOpacity
                    key={acct.id}
                    onPress={() => setToAccount(acct)}
                    className={`flex-1 rounded-xl p-3 ${
                      toAccount?.id === acct.id
                        ? "border-2 border-primary-500 bg-primary-50"
                        : "border border-neutral-200 bg-white"
                    }`}
                  >
                    <Text className="text-xs text-neutral-500">
                      {acct.name} ({acct.currency})
                    </Text>
                    <Text className="mt-1 text-base font-bold text-neutral-900">
                      {CURRENCY_SYMBOLS[acct.currency] || ""}
                      {acct.balance.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Converted Amount Preview */}
          {convertedAmount && toAccount && (
            <View className="mx-6 mt-4 rounded-xl bg-neutral-50 p-4">
              <Text className="text-sm text-neutral-500">You'll receive</Text>
              <Text className="mt-1 text-2xl font-bold text-neutral-900">
                {CURRENCY_SYMBOLS[toAccount.currency] || ""}
                {convertedAmount}
              </Text>
            </View>
          )}
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            title="Exchange"
            onPress={handleExchange}
            loading={processing}
            disabled={!fromAccount || !toAccount || !amount}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

