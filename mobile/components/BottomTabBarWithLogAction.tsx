import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogFoodSheets } from "@/components/LogFoodSheets";
import { mobileTheme } from "@/lib/theme";

const TAB_BAR_HEIGHT = 68;
const MIN_BOTTOM_INSET = 12;
const CONTENT_GAP = 16;

export function getBottomTabBarContentPadding(bottomInset: number) {
  return TAB_BAR_HEIGHT + Math.max(bottomInset, MIN_BOTTOM_INSET) + CONTENT_GAP;
}

export function BottomTabBarWithLogAction({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [isLogFoodVisible, setIsLogFoodVisible] = useState(false);

  return (
    <>
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 items-center px-5"
        style={{
          paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET),
        }}
      >
        <View className="flex-row items-center gap-20">
          <View className="h-[68px] flex-row items-center rounded-full border border-border-subtle bg-surface-tabBar shadow-lg shadow-black/50">
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;
              const color = isFocused
                ? mobileTheme.text.primary
                : mobileTheme.text.muted;
              const label =
                options.title !== undefined ? options.title : route.name;
              const icon = options.tabBarIcon?.({
                color,
                focused: isFocused,
                size: 25,
              });

              return (
                <Pressable
                  key={route.key}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  className="h-[68px] w-[104px] items-center justify-center"
                  onPress={() => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      void Haptics.selectionAsync();
                      navigation.navigate(route.name, route.params);
                    }
                  }}
                >
                  {icon}
                  <Text
                    className={
                      isFocused
                        ? "mt-0.5 text-[11px] font-bold text-text-primary"
                        : "mt-0.5 text-[11px] font-semibold text-text-muted"
                    }
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel="Log food"
            accessibilityRole="button"
            className="h-[68px] w-[68px] items-center justify-center rounded-full bg-text-primary shadow-lg shadow-black/50"
            onPress={() => {
              void Haptics.selectionAsync();
              setIsLogFoodVisible(true);
            }}
          >
            <Ionicons color={mobileTheme.text.inverse} name="add" size={30} />
          </Pressable>
        </View>
      </View>
      <LogFoodSheets
        visible={isLogFoodVisible}
        onClose={() => setIsLogFoodVisible(false)}
      />
    </>
  );
}
