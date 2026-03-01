import React, { forwardRef } from "react";
import { View, TextInput, Text, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-neutral-700">
            {label}
          </Text>
        )}
        <View
          className={cn(
            "flex-row items-center rounded-xl border bg-white px-4",
            error ? "border-danger-500" : "border-neutral-200",
            className,
          )}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 py-3.5 text-base text-neutral-900"
            placeholderTextColor="#94A3B8"
            {...props}
          />
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
        {error && <Text className="mt-1 text-sm text-danger-500">{error}</Text>}
      </View>
    );
  },
);

Input.displayName = "Input";

