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
import { controlStyles } from "@/lib/styles";

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
            className={`min-h-80 max-h-[92%] w-full overflow-hidden rounded-t-[28px] bg-surface-sheet ${sheetClassName}`}
          >
            <View className="items-center pb-3 pt-4">
              <View className="h-1.5 w-12 rounded-full bg-border-subtle" />
            </View>
            <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-4">
              <Pressable
                className={`${controlStyles.textAction} min-w-16 items-start`}
                disabled={closeDisabled}
                onPress={onClose}
              >
                <Text className="text-base text-text-secondary">Cancel</Text>
              </Pressable>
              <Text className="text-lg font-semibold text-text-primary">
                {title}
              </Text>
              {onAction ? (
                <Pressable
                  className={`${controlStyles.textAction} min-w-16 items-end`}
                  disabled={actionDisabled}
                  onPress={onAction}
                >
                  <Text
                    className={`text-base font-semibold ${actionDisabled ? "text-text-muted" : "text-text-primary"}`}
                  >
                    {actionLabel}
                  </Text>
                </Pressable>
              ) : (
                <View className="w-16" />
              )}
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
