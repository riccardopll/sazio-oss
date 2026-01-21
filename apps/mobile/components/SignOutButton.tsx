import { useClerk } from "@clerk/clerk-expo";
import { Button } from "react-native";

export function SignOutButton() {
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    await signOut();
  };
  return <Button title="Sign Out" onPress={handleSignOut} />;
}
