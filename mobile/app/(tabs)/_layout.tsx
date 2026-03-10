import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { mobileTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }
  return (
    <NativeTabs
      backgroundColor={mobileTheme.surface.tabBar}
      blurEffect="none"
      disableTransparentOnScrollEdge
      shadowColor={mobileTheme.border.subtle}
      tintColor={mobileTheme.text.primary}
      iconColor={{
        default: mobileTheme.text.muted,
        selected: mobileTheme.text.primary,
      }}
      labelStyle={{
        default: {
          color: mobileTheme.text.muted,
          fontSize: 12,
          fontWeight: "500",
        },
        selected: {
          color: mobileTheme.text.primary,
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <NativeTabs.Trigger
        name="index"
        contentStyle={{ backgroundColor: mobileTheme.surface.app }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.pie", selected: "chart.pie.fill" }}
          selectedColor={mobileTheme.text.primary}
        />
        <NativeTabs.Trigger.Label>Dashboard</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="log"
        contentStyle={{ backgroundColor: mobileTheme.surface.app }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          selectedColor={mobileTheme.text.primary}
        />
        <NativeTabs.Trigger.Label>Log</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="settings"
        contentStyle={{ backgroundColor: mobileTheme.surface.app }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          selectedColor={mobileTheme.text.primary}
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
