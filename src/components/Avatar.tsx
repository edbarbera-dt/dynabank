import React from "react";
import { View, Text, Image } from "react-native";
import { cn } from "@/utils/cn";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-2xl",
};

export function Avatar({ uri, name, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={cn("rounded-full", sizeMap[size], className)}
      />
    );
  }

  return (
    <View
      className={cn(
        "items-center justify-center rounded-full bg-primary-100",
        sizeMap[size],
        className,
      )}
    >
      <Text className={cn("font-semibold text-primary-500", textSizeMap[size])}>
        {initials}
      </Text>
    </View>
  );
}

