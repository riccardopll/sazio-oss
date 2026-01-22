import { useClerk } from "@clerk/clerk-expo";
import { Button } from "react-native";

export function SignOutButton() {
  const { signOut } = useClerk();
  return <Button title="Sign Out" onPress={() => signOut()} />;
}
