import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import {
  getAccounts,
  getTransactions,
  type Account,
  type Transaction,
} from "@/lib/database";
import { TransactionItem, LoadingSpinner } from "@/components";
import { format, isToday, isYesterday, parseISO } from "date-fns";

const CATEGORIES = [
  "All",
  "transfer",
  "top_up",
  "exchange",
  "payment",
  "salary",
  "subscription",
  "food",
  "transport",
  "shopping",
  "entertainment",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  All: "All",
  transfer: "Transfer",
  top_up: "Top Up",
  exchange: "Exchange",
  payment: "Payment",
  salary: "Salary",
  subscription: "Subscription",
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Fun",
};

export default function TransactionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const accts = await getAccounts(user.id);
      setAccounts(accts);
      const primary = accts.find((a) => a.is_primary) || accts[0];
      if (!selectedAccount && primary) {
        setSelectedAccount(primary);
      }
      const account = selectedAccount || primary;
      if (account) {
        const txns = await getTransactions(account.id);
        setTransactions(txns);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedAccount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const filteredTransactions =
    selectedCategory === "All"
      ? transactions
      : transactions.filter((t) => t.category === selectedCategory);

  const groupedTransactions = groupByDate(filteredTransactions);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-neutral-900">
          Transactions
        </Text>

        {/* Account Selector */}
        {accounts.length > 1 && (
          <View className="mt-3 flex-row gap-2">
            {accounts.map((acct) => (
              <TouchableOpacity
                key={acct.id}
                onPress={() => {
                  setSelectedAccount(acct);
                  setLoading(true);
                }}
                className={`rounded-full px-4 py-2 ${
                  selectedAccount?.id === acct.id
                    ? "bg-primary-500"
                    : "bg-neutral-100"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedAccount?.id === acct.id
                      ? "text-white"
                      : "text-neutral-600"
                  }`}
                >
                  {acct.account_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="max-h-12 py-2"
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            className={`rounded-full px-3 py-1.5 ${
              selectedCategory === item ? "bg-primary-500" : "bg-neutral-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                selectedCategory === item ? "text-white" : "text-neutral-600"
              }`}
            >
              {CATEGORY_LABELS[item] || item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Transaction List */}
      <FlatList
        data={groupedTransactions}
        keyExtractor={(item) =>
          item.type === "header" ? `header-${item.title}` : item.id
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <Text className="mb-1 mt-4 text-sm font-semibold text-neutral-400">
                {item.title}
              </Text>
            );
          }
          return (
            <TransactionItem
              transaction={item}
              onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text className="mt-3 text-base text-neutral-400">
              No transactions found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

type GroupedItem =
  | { type: "header"; title: string }
  | (Transaction & { type: "transaction" });

function groupByDate(transactions: Transaction[]): GroupedItem[] {
  const groups: GroupedItem[] = [];
  let currentDate = "";

  for (const txn of transactions) {
    const date = parseISO(txn.created_at);
    let dateLabel: string;

    if (isToday(date)) {
      dateLabel = "Today";
    } else if (isYesterday(date)) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = format(date, "d MMM yyyy");
    }

    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      groups.push({ type: "header", title: dateLabel });
    }

    groups.push({ ...txn, type: "transaction" });
  }

  return groups;
}

