import { useUser } from "@clerk/clerk-expo";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignOutButton } from "@/components/SignOutButton";

export default function Settings() {
  const { user } = useUser();
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center pt-12">
        <Text className="text-2xl font-bold text-gray-900">
          {user?.firstName}
        </Text>
        <Text className="text-base text-gray-500 mt-1">
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
        <View className="mt-8">
          <SignOutButton />
        </View>
      </View>
    </SafeAreaView>
  );
}
