import { useSSO } from "@clerk/expo";
import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "@/assets/images/ios_dark_sq_ctn.svg";
import { DashboardCard } from "@/components/DashboardCard";

export default function SignIn() {
  const { startSSOFlow } = useSSO();
  const onGoogleSignIn = async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
    });
    if (createdSessionId) {
      await setActive!({ session: createdSessionId });
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-surface-app">
      <View className="flex-1 justify-center p-5">
        <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
          Sazio
        </Text>
        <Text className="mt-2 text-4xl font-bold leading-tight text-text-primary">
          Macro tracking with a real black interface.
        </Text>
        <Text className="mt-4 max-w-[320px] text-base leading-6 text-text-secondary">
          Sign in to access your dashboard, goals, and future meal logging in a
          darker, denser mobile shell.
        </Text>
        <DashboardCard className="mt-8">
          <Text className="text-lg font-semibold text-text-primary">
            Continue with Google
          </Text>
          <Text className="mt-3 text-sm leading-6 text-text-muted">
            Authentication stays simple, but the screen now matches the rest of
            the black and graphite redesign.
          </Text>
          <Pressable
            onPress={onGoogleSignIn}
            className="mt-5 self-start active:opacity-80"
          >
            <GoogleSignInButton width={199} height={44} />
          </Pressable>
        </DashboardCard>
      </View>
    </SafeAreaView>
  );
}
