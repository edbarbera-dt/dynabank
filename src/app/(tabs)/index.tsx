import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import {
  getProfile,
  getAccounts,
  getRecentTransactions,
  type Profile,
  type Account,
  type Transaction,
} from "@/lib/database";
import {
  AccountCard,
  TransactionItem,
  LoadingSpinner,
  Avatar,
} from "@/components";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const [profileData, accountsData] = await Promise.all([
        getProfile(user.id),
        getAccounts(user.id),
      ]);

      setProfile(profileData);
      setAccounts(accountsData);

      // Get transactions for primary account
      const primaryAccount = accountsData.find((a) => a.is_primary);
      if (primaryAccount) {
        const txns = await getRecentTransactions(primaryAccount.id, 5);
        setTransactions(txns);
      }
    } catch (err) {
      console.error("Error fetching home data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const primaryAccount = accounts.find((a) => a.is_primary);
  const greeting = getGreeting();
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <View className="flex-1">
            <Text className="text-sm text-neutral-500">{greeting}</Text>
            <Text className="text-xl font-bold text-neutral-900">
              {firstName} 👋
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <Avatar
              uri={profile?.avatar_url}
              name={profile?.full_name || "U"}
              size="md"
            />
          </TouchableOpacity>
        </View>

        {/* Primary Account Card */}
        {primaryAccount && (
          <View className="px-6 pt-4">
            <AccountCard account={primaryAccount} />
          </View>
        )}

        {/* Quick Actions */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-lg font-semibold text-neutral-900">
            Quick Actions
          </Text>
          <View className="flex-row justify-between">
            <QuickAction
              icon="arrow-up-outline"
              label="Transfer"
              onPress={() => router.push("/(tabs)/payments/transfer")}
            />
            <QuickAction
              icon="add-circle-outline"
              label="Top Up"
              onPress={() => router.push("/(tabs)/payments/top-up")}
            />
            <QuickAction
              icon="globe-outline"
              label="Exchange"
              onPress={() => router.push("/(tabs)/payments/exchange")}
            />
            <QuickAction
              icon="card-outline"
              label="Cards"
              onPress={() => router.push("/(tabs)/cards")}
            />
          </View>
        </View>

        {/* Account Summary */}
        {accounts.length > 1 && (
          <View className="mt-6 px-6">
            <Text className="mb-3 text-lg font-semibold text-neutral-900">
              Accounts
            </Text>
            {accounts
              .filter((a) => !a.is_primary)
              .map((account) => (
                <View key={account.id} className="mb-3">
                  <AccountCard account={account} compact />
                </View>
              ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View className="mt-6 px-6 pb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-neutral-900">
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text className="text-sm font-medium text-primary-500">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View className="mt-4 items-center py-8">
              <Ionicons name="receipt-outline" size={32} color="#CBD5E1" />
              <Text className="mt-2 text-sm text-neutral-400">
                No transactions yet
              </Text>
            </View>
          ) : (
            <View className="mt-2">
              {transactions.map((txn) => (
                <TransactionItem
                  key={txn.id}
                  transaction={txn}
                  onPress={() => router.push(`/(tabs)/transactions/${txn.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="items-center"
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="mb-2 h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
        <Ionicons name={icon} size={24} color="#1A73E8" />
      </View>
      <Text className="text-xs font-medium text-neutral-600">{label}</Text>
    </TouchableOpacity>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

