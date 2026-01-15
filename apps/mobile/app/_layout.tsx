import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { TRPCProvider } from "../lib/TRPCProvider";
import "../global.css";

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <TRPCProvider>
        <Slot />
      </TRPCProvider>
    </ClerkProvider>
  );
}
