import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { BottomTabBarWithLogAction } from "@/components/BottomTabBarWithLogAction";

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
      tabBar={(props) => <BottomTabBarWithLogAction {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={size}
            />
          ),
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? "settings" : "settings-outline"}
              size={size}
            />
          ),
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
