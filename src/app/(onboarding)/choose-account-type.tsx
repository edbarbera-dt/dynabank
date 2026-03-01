import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components";

export default function ChooseAccountTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = React.useState<
    "personal" | "business" | null
  >(null);

  const handleContinue = () => {
    if (selected) {
      router.push({
        pathname: "/(onboarding)/select-country",
        params: { accountType: selected },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-6">
        <Text className="text-3xl font-bold text-neutral-900">
          Choose Account Type
        </Text>
        <Text className="mt-2 text-base text-neutral-500">
          Select the type of account you'd like to open
        </Text>

        <View className="mt-8 space-y-4">
          <AccountTypeCard
            icon="person-outline"
            title="Personal Account"
            description="For everyday banking, savings, and personal finance management"
            selected={selected === "personal"}
            onPress={() => setSelected("personal")}
          />
          <AccountTypeCard
            icon="business-outline"
            title="Business Account"
            description="For your business transactions, invoicing, and expense tracking"
            selected={selected === "business"}
            onPress={() => setSelected("business")}
          />
        </View>
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

function AccountTypeCard({
  icon,
  title,
  description,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className={`rounded-xl border-2 p-5 ${
        selected ? "border-primary-500 bg-primary-50" : "border-neutral-200"
      }`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View
          className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${
            selected ? "bg-primary-500" : "bg-neutral-100"
          }`}
        >
          <Ionicons
            name={icon}
            size={24}
            color={selected ? "#FFFFFF" : "#64748B"}
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-neutral-900">
            {title}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500">{description}</Text>
        </View>
        {selected && (
          <Ionicons name="checkmark-circle" size={24} color="#1A73E8" />
        )}
      </View>
    </TouchableOpacity>
  );
}

