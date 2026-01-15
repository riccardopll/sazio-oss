import { Text, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "@/components/SignOutButton";

export default function SettingsScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-6">Settings</Text>

        <View className="p-4 mb-6">
          <Text className="text-lg font-semibold mb-1">
            {user?.fullName || user?.firstName || "User"}
          </Text>
          <Text className="text-sm">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        <View className="mt-auto items-center pb-24">
          <SignOutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}
