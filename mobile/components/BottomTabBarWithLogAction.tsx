import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { GlassContainer, GlassView } from "expo-glass-effect";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogFoodSheets } from "@/components/LogFoodSheets";
import { mobileTheme } from "@/lib/theme";

const TAB_BAR_HEIGHT = 56;
const TAB_BUTTON_WIDTH = 88;
const ACTION_BUTTON_SIZE = 56;
const TAB_ACTION_GAP = 105;
const GLASS_TINT = "rgba(18, 18, 20, 0.62)";
const MIN_BOTTOM_INSET = 10;
const CONTENT_GAP = 12;

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
  const tabBarStyle = {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: mobileTheme.border.subtle,
    overflow: "hidden" as const,
  };
  const actionButtonStyle = {
    height: ACTION_BUTTON_SIZE,
    width: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: mobileTheme.border.strong,
    overflow: "hidden" as const,
  };
  const tabBarContent = (
    <View className="flex-row items-center">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused
          ? mobileTheme.text.primary
          : mobileTheme.text.muted;
        const label = options.title !== undefined ? options.title : route.name;
        const icon = options.tabBarIcon?.({
          color,
          focused: isFocused,
          size: 22,
        });

        return (
          <Pressable
            key={route.key}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            className="items-center justify-center"
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
            style={{ height: TAB_BAR_HEIGHT, width: TAB_BUTTON_WIDTH }}
          >
            {icon}
            <Text
              className={
                isFocused
                  ? "mt-0.5 text-[10px] font-bold text-text-primary"
                  : "mt-0.5 text-[10px] font-semibold text-text-muted"
              }
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
  const actionButtonContent = (
    <Pressable
      accessibilityLabel="Log food"
      accessibilityRole="button"
      className="items-center justify-center"
      onPress={() => {
        void Haptics.selectionAsync();
        setIsLogFoodVisible(true);
      }}
      style={{ height: ACTION_BUTTON_SIZE, width: ACTION_BUTTON_SIZE }}
    >
      <Ionicons color={mobileTheme.text.primary} name="add" size={26} />
    </Pressable>
  );
  const tabBar = (
    <GlassView
      colorScheme="dark"
      glassEffectStyle="regular"
      style={tabBarStyle}
      tintColor={GLASS_TINT}
    >
      {tabBarContent}
    </GlassView>
  );
  const actionButton = (
    <GlassView
      colorScheme="dark"
      glassEffectStyle="regular"
      isInteractive
      style={actionButtonStyle}
      tintColor={GLASS_TINT}
    >
      {actionButtonContent}
    </GlassView>
  );

  return (
    <>
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 items-center px-4"
        style={{
          paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET),
        }}
      >
        <GlassContainer
          className="flex-row items-center"
          spacing={TAB_ACTION_GAP}
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: TAB_ACTION_GAP,
          }}
        >
          {tabBar}
          {actionButton}
        </GlassContainer>
      </View>
      <LogFoodSheets
        visible={isLogFoodVisible}
        onClose={() => setIsLogFoodVisible(false)}
      />
    </>
  );
}
