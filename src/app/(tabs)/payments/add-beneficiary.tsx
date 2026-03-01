import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { addBeneficiary } from "@/lib/database";
import { Button, Input } from "@/components";

export default function AddBeneficiaryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter the beneficiary name.");
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      Alert.alert(
        "Invalid Account Number",
        "Please enter a valid 8-digit account number.",
      );
      return;
    }
    if (!sortCode.trim() || sortCode.length < 6) {
      Alert.alert(
        "Invalid Sort Code",
        "Please enter a valid 6-digit sort code.",
      );
      return;
    }

    setSaving(true);
    try {
      await addBeneficiary(user.id, {
        name: name.trim(),
        bank_name: "DynaBank",
        account_number: accountNumber.trim(),
        sort_code: sortCode.trim(),
      });
      Alert.alert("Success", "Beneficiary added successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add beneficiary.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center px-6 pt-4 pb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-neutral-900">
              Add Beneficiary
            </Text>
          </View>

          <View className="mt-6 px-6">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <View className="mt-4">
              <Input
                label="Account Number"
                placeholder="12345678"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>
            <View className="mt-4">
              <Input
                label="Sort Code"
                placeholder="123456"
                value={sortCode}
                onChangeText={setSortCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button
            title="Add Beneficiary"
            onPress={handleSave}
            loading={saving}
            disabled={!name || !accountNumber || !sortCode}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

