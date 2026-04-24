import { View, type ViewProps } from "react-native";
import { cardStyles, cn } from "@/lib/styles";

interface CardProps extends ViewProps {
  contentClassName?: string;
}

export function Card({
  children,
  className,
  contentClassName,
  ...props
}: CardProps) {
  return (
    <View className={cn(cardStyles.base, className)} {...props}>
      <View className={contentClassName ?? cardStyles.content}>{children}</View>
    </View>
  );
}
