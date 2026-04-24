import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { cn, screenStyles, textStyles } from "@/lib/styles";

interface ScreenHeaderProps {
  embedded?: boolean;
  eyebrow?: string;
  leftAccessory?: ReactNode;
  title: string;
}

export function ScreenHeader({
  embedded,
  eyebrow,
  leftAccessory,
  title,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        embedded ? screenStyles.embeddedHeader : screenStyles.header,
        "flex-row items-center gap-3",
      )}
    >
      {leftAccessory}
      <View className="min-w-0 flex-1">
        {eyebrow ? <Text className={textStyles.eyebrow}>{eyebrow}</Text> : null}
        <Text
          className={
            eyebrow ? textStyles.screenTitleWithEyebrow : textStyles.screenTitle
          }
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
