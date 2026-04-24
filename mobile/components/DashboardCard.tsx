import { View, type ViewProps } from "react-native";

interface DashboardCardProps extends ViewProps {
  contentClassName?: string;
}

export function DashboardCard({
  children,
  className,
  contentClassName,
  ...props
}: DashboardCardProps) {
  return (
    <View
      className={`overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40 ${className ?? ""}`}
      {...props}
    >
      <View className={contentClassName ?? "p-5"}>{children}</View>
    </View>
  );
}
