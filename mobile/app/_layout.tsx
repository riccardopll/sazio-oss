import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { TRPCProvider } from "../lib/TRPCProvider";
import { mobileTheme, navigationTheme } from "../lib/theme";
import "../global.css";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(mobileTheme.surface.app);
  }, []);

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <TRPCProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" backgroundColor={mobileTheme.surface.app} />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="log-food"
              options={{
                animation: "fade",
                contentStyle: { backgroundColor: "transparent" },
                presentation: "transparentModal",
              }}
            />
          </Stack>
        </ThemeProvider>
      </TRPCProvider>
    </ClerkProvider>
  );
}
