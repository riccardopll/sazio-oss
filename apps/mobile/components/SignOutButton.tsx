import { useClerk } from "@clerk/clerk-expo";
import { Button } from "react-native";
import * as Haptics from "expo-haptics";

export function SignOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await signOut();
  };

  return <Button title="Sign Out" onPress={handleSignOut} />;
}
