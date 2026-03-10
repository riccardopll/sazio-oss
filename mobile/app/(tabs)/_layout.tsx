import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.pie", selected: "chart.pie.fill" }}
        />
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="log">
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
        />
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
