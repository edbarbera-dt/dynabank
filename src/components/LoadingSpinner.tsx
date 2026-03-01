import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#1A73E8" />
      {message && (
        <Text className="mt-3 text-sm text-neutral-500">{message}</Text>
      )}
    </View>
  );
}

