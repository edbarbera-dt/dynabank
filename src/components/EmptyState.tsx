import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({
  icon = "folder-open-outline",
  title,
  description,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name={icon} size={48} color="#CBD5E1" />
      <Text className="mt-4 text-center text-lg font-semibold text-neutral-700">
        {title}
      </Text>
      {description && (
        <Text className="mt-2 text-center text-sm text-neutral-400">
          {description}
        </Text>
      )}
    </View>
  );
}

