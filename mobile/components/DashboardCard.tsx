import { View, type ViewProps } from "react-native";

export function DashboardCard({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={`overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40 ${className ?? ""}`}
      {...props}
    >
      <View className="p-5">{children}</View>
    </View>
  );
}
