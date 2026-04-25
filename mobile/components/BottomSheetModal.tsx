import { Ionicons } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn, controlStyles } from "@/lib/styles";
import { mobileTheme } from "@/lib/theme";

const CLOSE_BUTTON_SIZE = 40;
const GLASS_TINT = "rgba(24, 24, 28, 0.72)";

interface BottomSheetModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actionLabel?: string;
  actionDisabled?: boolean;
  closeDisabled?: boolean;
  onAction?: () => void;
  size?: "default" | "goal" | "foodCreate" | "foodLog";
}

const SHEET_SIZE_CLASS_NAMES = {
  default: "h-[82%]",
  goal: "h-[78%]",
  foodCreate: "h-[84%]",
  foodLog: "h-[88%]",
} as const;

export function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  actionLabel = "Save",
  actionDisabled = false,
  closeDisabled = false,
  onAction,
  size = "default",
}: BottomSheetModalProps) {
  const sheetClassName = SHEET_SIZE_CLASS_NAMES[size];

  return (
    <Modal
      animationType="slide"
      onRequestClose={closeDisabled ? () => {} : onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close modal"
          accessibilityRole="button"
          className="absolute inset-0 bg-black/55"
          onPress={closeDisabled ? undefined : onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full justify-end"
        >
          <View
            className={cn(
              "min-h-80 max-h-[92%] w-full overflow-hidden rounded-t-[28px] bg-surface-sheet",
              sheetClassName,
            )}
          >
            <View className="px-5 pb-2 pt-2">
              <View className="items-center">
                <View className="h-1 w-12 rounded-full bg-border-strong" />
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                <Pressable
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  className={cn(closeDisabled && "opacity-40")}
                  disabled={closeDisabled}
                  onPress={onClose}
                  style={{
                    height: CLOSE_BUTTON_SIZE,
                    width: CLOSE_BUTTON_SIZE,
                  }}
                >
                  <GlassView
                    colorScheme="dark"
                    glassEffectStyle="regular"
                    isInteractive
                    style={{
                      alignItems: "center",
                      borderColor: mobileTheme.border.strong,
                      borderRadius: CLOSE_BUTTON_SIZE / 2,
                      borderWidth: 1,
                      height: CLOSE_BUTTON_SIZE,
                      justifyContent: "center",
                      overflow: "hidden",
                      width: CLOSE_BUTTON_SIZE,
                    }}
                    tintColor={GLASS_TINT}
                  >
                    <Ionicons
                      color={mobileTheme.text.primary}
                      name="close"
                      size={27}
                    />
                  </GlassView>
                </Pressable>

                <Text className="text-center text-[20px] font-bold leading-6 text-text-primary">
                  {title}
                </Text>

                {onAction ? (
                  <Pressable
                    className={cn(
                      controlStyles.textAction,
                      "items-end",
                      actionDisabled && "opacity-40",
                    )}
                    disabled={actionDisabled}
                    onPress={onAction}
                    style={{ width: CLOSE_BUTTON_SIZE }}
                  >
                    <Text
                      className={cn(
                        "text-[15px] font-semibold",
                        actionDisabled
                          ? "text-text-muted"
                          : "text-text-primary",
                      )}
                    >
                      {actionLabel}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={{ width: CLOSE_BUTTON_SIZE }} />
                )}
              </View>
            </View>
            <SafeAreaView
              className="flex-1 bg-surface-sheet"
              edges={["bottom"]}
            >
              {children}
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
