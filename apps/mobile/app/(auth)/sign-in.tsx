import { useSSO } from "@clerk/clerk-expo";
import { View, Pressable } from "react-native";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "@/assets/images/ios_dark_sq_ctn.svg";

export default function SignIn() {
  const { startSSOFlow } = useSSO();
  const onGoogleSignIn = useCallback(async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
    });
    if (createdSessionId) {
      await setActive!({ session: createdSessionId });
    }
  }, [startSSOFlow]);
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center p-5">
        <Pressable onPress={onGoogleSignIn} className="active:opacity-80">
          <GoogleSignInButton width={199} height={44} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
