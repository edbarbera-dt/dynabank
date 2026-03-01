import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";

const COUNTRIES = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
];

export default function SelectCountryScreen() {
  const router = useRouter();
  const { accountType } = useLocalSearchParams<{ accountType: string }>();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleContinue = () => {
    if (selected) {
      router.push({
        pathname: "/(onboarding)/enter-phone",
        params: { accountType, country: selected },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-50"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-neutral-900">
          Country of Residence
        </Text>
        <Text className="mt-2 text-base text-neutral-500">
          Select the country where you currently live
        </Text>

        {/* Search */}
        <View className="mt-6 flex-row items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4">
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            className="ml-2 flex-1 py-3 text-base text-neutral-900"
            placeholder="Search countries..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Country List */}
        <FlatList
          data={filtered}
          className="mt-4"
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`flex-row items-center rounded-xl px-4 py-3 ${
                selected === item.code ? "bg-primary-50" : ""
              }`}
              onPress={() => setSelected(item.code)}
              activeOpacity={0.6}
            >
              <Text className="mr-3 text-2xl">{item.flag}</Text>
              <Text className="flex-1 text-base text-neutral-900">
                {item.name}
              </Text>
              {selected === item.code && (
                <Ionicons name="checkmark-circle" size={22} color="#1A73E8" />
              )}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View className="px-6 pb-4">
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

