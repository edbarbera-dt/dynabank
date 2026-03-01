import React, { useRef, useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import { cn } from "@/utils/cn";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: string;
  label?: string;
}

export function PinInput({
  length = 6,
  onComplete,
  error,
  label,
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const chars = text.slice(0, length).split("");
      const newPin = [...pin];
      chars.forEach((char, i) => {
        if (index + i < length) {
          newPin[index + i] = char;
        }
      });
      setPin(newPin);
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      if (newPin.every((d) => d !== "")) {
        onComplete(newPin.join(""));
      }
      return;
    }

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((d) => d !== "")) {
      onComplete(newPin.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !pin[index] && index > 0) {
      const newPin = [...pin];
      newPin[index - 1] = "";
      setPin(newPin);
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="items-center">
      {label && (
        <Text className="mb-4 text-base font-medium text-neutral-700">
          {label}
        </Text>
      )}
      <View className="flex-row gap-3">
        {pin.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => inputRefs.current[index]?.focus()}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className={cn(
                "h-14 w-12 rounded-xl border-2 text-center text-xl font-bold text-neutral-900",
                focusedIndex === index
                  ? "border-primary-500"
                  : error
                    ? "border-danger-500"
                    : "border-neutral-200",
              )}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          </Pressable>
        ))}
      </View>
      {error && <Text className="mt-3 text-sm text-danger-500">{error}</Text>}
    </View>
  );
}

