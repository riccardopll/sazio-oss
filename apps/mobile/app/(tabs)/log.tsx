import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LogScreen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-2xl font-bold text-center mb-4">Log Food</Text>
        <Text className="text-base text-center">Food logging coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
