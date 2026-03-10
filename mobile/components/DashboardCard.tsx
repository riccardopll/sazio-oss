import { View, type ViewProps } from "react-native";
import { mobileTheme } from "@/lib/theme";

export function DashboardCard({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={`overflow-hidden rounded-[28px] border border-border-subtle bg-surface-card ${className ?? ""}`}
      style={{
        shadowColor: mobileTheme.surface.app,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.36,
        shadowRadius: 28,
        elevation: 14,
      }}
      {...props}
    >
      <View className="p-5">{children}</View>
    </View>
  );
}
