import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { Button, Input } from "@/components";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-neutral-50"
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6 pt-6">
          {sent ? (
            <View className="flex-1 items-center justify-center">
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-success-50">
                <Ionicons name="mail-open-outline" size={40} color="#22C55E" />
              </View>
              <Text className="text-2xl font-bold text-neutral-900">
                Check Your Email
              </Text>
              <Text className="mt-3 text-center text-base text-neutral-500">
                We've sent a password reset link to{"\n"}
                <Text className="font-medium text-neutral-700">{email}</Text>
              </Text>
              <Button
                title="Back to Login"
                variant="outline"
                onPress={() => router.replace("/(auth)/login")}
                className="mt-8"
              />
            </View>
          ) : (
            <>
              <Text className="text-3xl font-bold text-neutral-900">
                Reset Password
              </Text>
              <Text className="mt-2 text-base text-neutral-500">
                Enter your email and we'll send you a reset link
              </Text>

              <View className="mt-8">
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={
                    <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                  }
                />
              </View>

              <View className="mt-8">
                <Button
                  title="Send Reset Link"
                  onPress={handleReset}
                  loading={loading}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

