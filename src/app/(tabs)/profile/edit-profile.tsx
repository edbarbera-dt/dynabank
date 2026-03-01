import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/lib/auth";
import { getProfile, updateProfile, type Profile } from "@/lib/database";
import { Button, Input, Avatar, LoadingSpinner } from "@/components";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getProfile(user.id);
      setProfile(data);
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user || !fullName.trim()) {
      Alert.alert("Error", "Please enter your full name.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl,
      });
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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
              Edit Profile
            </Text>
          </View>

          {/* Avatar */}
          <View className="mt-6 items-center">
            <TouchableOpacity onPress={pickImage}>
              <Avatar uri={avatarUrl} name={fullName || "U"} size="lg" />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary-500">
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="mt-8 px-6">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <View className="mt-4">
              <Input label="Email" value={user?.email || ""} editable={false} />
            </View>

            <View className="mt-4">
              <Input
                label="Phone Number"
                placeholder="+44 7700 900000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {profile?.country && (
              <View className="mt-4">
                <Input
                  label="Country"
                  value={profile.country}
                  editable={false}
                />
              </View>
            )}

            {profile?.account_type && (
              <View className="mt-4">
                <Input
                  label="Account Type"
                  value={
                    profile.account_type.charAt(0).toUpperCase() +
                    profile.account_type.slice(1)
                  }
                  editable={false}
                />
              </View>
            )}
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button title="Save Changes" onPress={handleSave} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

