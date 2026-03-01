import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SecurityScreen() {
  const router = useRouter();
  const [biometrics, setBiometrics] = React.useState(false);
  const [twoFactor, setTwoFactor] = React.useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
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
            Security
          </Text>
        </View>

        {/* Biometric Auth */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Authentication
          </Text>
          <View className="rounded-2xl bg-neutral-50">
            <View className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-4">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <Ionicons name="finger-print" size={18} color="#64748B" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base text-neutral-700">
                    Biometric Login
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    Use Face ID or fingerprint
                  </Text>
                </View>
              </View>
              <Switch
                value={biometrics}
                onValueChange={(val) => {
                  setBiometrics(val);
                  Alert.alert(
                    val ? "Enabled" : "Disabled",
                    `Biometric login ${val ? "enabled" : "disabled"}.`,
                  );
                }}
                trackColor={{ false: "#E2E8F0", true: "#1A73E8" }}
              />
            </View>

            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <Ionicons name="shield-checkmark" size={18} color="#64748B" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base text-neutral-700">
                    Two-Factor Auth
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    Extra layer of security
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={(val) => {
                  setTwoFactor(val);
                  Alert.alert(
                    val ? "Enabled" : "Disabled",
                    `Two-factor authentication ${val ? "enabled" : "disabled"}.`,
                  );
                }}
                trackColor={{ false: "#E2E8F0", true: "#1A73E8" }}
              />
            </View>
          </View>
        </View>

        {/* PIN */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            PIN
          </Text>
          <View className="rounded-2xl bg-neutral-50">
            <TouchableOpacity
              className="flex-row items-center px-4 py-4"
              onPress={() => router.push("/(tabs)/profile/change-pin")}
            >
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Ionicons name="keypad-outline" size={18} color="#64748B" />
              </View>
              <Text className="ml-3 flex-1 text-base text-neutral-700">
                Change PIN
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sessions */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Sessions
          </Text>
          <View className="rounded-2xl bg-neutral-50">
            <View className="flex-row items-center px-4 py-4">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color="#64748B"
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base text-neutral-700">
                  Current Device
                </Text>
                <Text className="text-xs text-neutral-400">Active now</Text>
              </View>
              <View className="rounded-full bg-success-50 px-2 py-0.5">
                <Text className="text-xs font-medium text-success-600">
                  Active
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

