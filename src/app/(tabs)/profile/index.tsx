import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { getProfile, type Profile } from "@/lib/database";
import { Avatar, LoadingSpinner } from "@/components";

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      {
        icon: "person-outline" as const,
        title: "Edit Profile",
        route: "/(tabs)/profile/edit-profile",
      },
      {
        icon: "shield-outline" as const,
        title: "Security",
        route: "/(tabs)/profile/security",
      },
      {
        icon: "keypad-outline" as const,
        title: "Change PIN",
        route: "/(tabs)/profile/change-pin",
      },
    ],
  },
  {
    section: "Preferences",
    items: [
      {
        icon: "notifications-outline" as const,
        title: "Notifications",
        route: null,
      },
      {
        icon: "globe-outline" as const,
        title: "Language",
        route: null,
      },
      {
        icon: "moon-outline" as const,
        title: "Appearance",
        route: null,
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        icon: "help-circle-outline" as const,
        title: "Help Centre",
        route: null,
      },
      {
        icon: "document-text-outline" as const,
        title: "Terms & Conditions",
        route: null,
      },
      {
        icon: "lock-closed-outline" as const,
        title: "Privacy Policy",
        route: null,
      },
    ],
  },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getProfile(user.id);
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
          />
        }
      >
        {/* Header */}
        <View className="items-center px-6 pt-6 pb-4">
          <Avatar
            uri={profile?.avatar_url}
            name={profile?.full_name || "User"}
            size="lg"
          />
          <Text className="mt-3 text-xl font-bold text-neutral-900">
            {profile?.full_name || "User"}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">{user?.email}</Text>
          {profile?.phone && (
            <Text className="mt-0.5 text-sm text-neutral-400">
              {profile.phone}
            </Text>
          )}
        </View>

        {/* Menu Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.section} className="mt-4 px-6">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {section.section}
            </Text>
            <View className="rounded-2xl bg-neutral-50">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  className={`flex-row items-center px-4 py-3.5 ${
                    index < section.items.length - 1
                      ? "border-b border-neutral-100"
                      : ""
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route as any);
                    } else {
                      Alert.alert(
                        "Coming Soon",
                        "This feature is coming soon.",
                      );
                    }
                  }}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
                    <Ionicons name={item.icon} size={18} color="#64748B" />
                  </View>
                  <Text className="ml-3 flex-1 text-base text-neutral-700">
                    {item.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View className="mt-6 px-6 pb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-2xl bg-danger-50 py-4"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-base font-semibold text-danger-500">
              Sign Out
            </Text>
          </TouchableOpacity>

          <Text className="mt-4 text-center text-xs text-neutral-300">
            DynaBank v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

