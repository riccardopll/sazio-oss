import { useSSO } from "@clerk/clerk-expo";
import { Text, View, Button } from "react-native";
import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const { startSSOFlow } = useSSO();

  const onGoogleSignIn = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
    });
    if (createdSessionId) {
      await setActive!({ session: createdSessionId });
    }
  }, [startSSOFlow]);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-2xl font-semibold text-center mb-2">
          Sign in to sazio-oss
        </Text>
        <Text className="text-base text-center mb-8">
          Welcome back! Please sign in to continue
        </Text>
        <View className="w-full max-w-[300px]">
          <Button title="Continue with Google" onPress={onGoogleSignIn} />
        </View>
      </View>
    </SafeAreaView>
  );
}
