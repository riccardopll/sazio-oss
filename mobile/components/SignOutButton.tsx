import { useClerk } from "@clerk/expo";
import { Pressable, Text } from "react-native";

export function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <Pressable
      onPress={() => signOut()}
      className="items-center rounded-[24px] border border-border-subtle bg-surface-card px-5 py-4 active:opacity-80"
    >
      <Text className="text-base font-semibold text-text-primary">
        Sign Out
      </Text>
    </Pressable>
  );
}
