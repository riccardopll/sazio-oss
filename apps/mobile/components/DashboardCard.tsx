import { View, type ViewProps } from "react-native";
import { GlassView } from "expo-glass-effect";

interface DashboardCardProps extends ViewProps {
  children: React.ReactNode;
}

export function DashboardCard({
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <GlassView
      className={`rounded-[32px] overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <View className="p-6">{children}</View>
    </GlassView>
  );
}
