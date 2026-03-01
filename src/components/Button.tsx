import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";
import { cn } from "@/utils/cn";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = true,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = "items-center justify-center rounded-xl";

  const variantStyles = {
    primary: "bg-primary-500",
    secondary: "bg-neutral-800",
    outline: "border-2 border-neutral-200 bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-danger-500",
  };

  const sizeStyles = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4",
  };

  const textVariantStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-neutral-900",
    ghost: "text-primary-500",
    danger: "text-white",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <TouchableOpacity
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50",
        className,
      )}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "ghost" ? "#1A73E8" : "#fff"
          }
          size="small"
        />
      ) : (
        <Text
          className={cn(
            "font-semibold",
            textVariantStyles[variant],
            textSizeStyles[size],
          )}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

