import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: mobileTheme.text.primary,
        tabBarInactiveTintColor: mobileTheme.text.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "settings" : "settings-outline"}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
