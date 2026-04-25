function requireEnv(name: string, value: string | undefined) {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  apiUrl: trimTrailingSlash(
    requireEnv("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL),
  ),
  clerkPublishableKey: requireEnv(
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  ),
} as const;
