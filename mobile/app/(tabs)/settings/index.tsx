import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";

export default function Settings() {
  const router = useRouter();
  const trpc = useTRPC();
  const { signOut } = useClerk();
  const { user } = useUser();
  const timezone = DateTime.local().zoneName;
  const { data: currentGoal } = useQuery(
    trpc.getCurrentGoal.queryOptions({
      timezone,
    }),
  );
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-4">
        <View>
          <Text className="text-3xl font-bold text-text-primary">Profile</Text>
        </View>

        <View className="mt-6 overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40">
          <View className="flex-row items-center gap-4 px-4 py-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#F5F5F7" name="person-outline" size={24} />
            </View>
            <View className="flex-1">
              <Text
                className="text-lg font-semibold text-text-primary"
                numberOfLines={1}
              >
                {user?.primaryEmailAddress?.emailAddress ?? "No email"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-xl font-medium text-text-muted">
            Goals & Tracking
          </Text>
        </View>
        <View className="mt-4 overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40">
          <Pressable
            className="flex-row items-center gap-4 px-4 py-4 active:opacity-80"
            onPress={() => router.push("/settings/goal")}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#F5F5F7" name="flag-outline" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-text-primary">
                My Goal
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              {!currentGoal ? (
                <View className="h-2.5 w-2.5 rounded-full bg-accent-soft" />
              ) : null}
              <Ionicons color="#8B8B92" name="chevron-forward" size={20} />
            </View>
          </Pressable>
        </View>

        <View className="mt-8">
          <Text className="text-xl font-medium text-text-muted">Account</Text>
        </View>
        <View className="mt-4 overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40">
          <Pressable
            className="flex-row items-center gap-4 px-4 py-4 active:opacity-80"
            onPress={handleSignOut}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#FF5D73" name="log-out-outline" size={20} />
            </View>
            <Text className="flex-1 text-lg font-semibold text-state-destructive">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
