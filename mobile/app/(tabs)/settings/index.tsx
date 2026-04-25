import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getBottomTabBarContentPadding } from "@/components/BottomTabBarWithLogAction";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { cardStyles, cn, screenStyles, textStyles } from "@/lib/styles";
import { useTRPC } from "@/lib/trpc";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <ScrollView
        className="flex-1"
        contentContainerClassName={screenStyles.scrollContent}
        contentContainerStyle={{
          paddingBottom: getBottomTabBarContentPadding(insets.bottom),
        }}
      >
        <ScreenHeader embedded title="Profile" />

        <Card className="mt-6" contentClassName="p-0">
          <View className={cardStyles.row}>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#F5F5F7" name="person-outline" size={24} />
            </View>
            <View className="flex-1">
              <Text className={textStyles.cardTitle} numberOfLines={1}>
                {user?.primaryEmailAddress?.emailAddress ?? "No email"}
              </Text>
            </View>
          </View>
        </Card>

        <View className="mt-8">
          <Text className={textStyles.sectionTitle}>Goals & Tracking</Text>
        </View>
        <Card className="mt-4" contentClassName="p-0">
          <Pressable
            className={cn(cardStyles.row, "active:opacity-80")}
            onPress={() => router.push("/settings/goal")}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#F5F5F7" name="flag-outline" size={20} />
            </View>
            <View className="flex-1">
              <Text className={textStyles.cardTitle}>My Goal</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {!currentGoal ? (
                <View className="h-2.5 w-2.5 rounded-full bg-accent-soft" />
              ) : null}
              <Ionicons color="#8B8B92" name="chevron-forward" size={20} />
            </View>
          </Pressable>
        </Card>

        <View className="mt-8">
          <Text className={textStyles.sectionTitle}>Account</Text>
        </View>
        <Card className="mt-4" contentClassName="p-0">
          <Pressable
            className={cn(cardStyles.row, "active:opacity-80")}
            onPress={handleSignOut}
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-raised">
              <Ionicons color="#FF5D73" name="log-out-outline" size={20} />
            </View>
            <Text className="flex-1 text-lg font-semibold text-state-destructive">
              Sign Out
            </Text>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
