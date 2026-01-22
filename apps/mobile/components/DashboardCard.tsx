import { View, type ViewProps } from "react-native";
import { GlassView } from "expo-glass-effect";

export function DashboardCard({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={`rounded-[28px] overflow-hidden ${className ?? ""}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
      }}
      {...props}
    >
      <GlassView
        className="rounded-[28px] overflow-hidden border border-white/20"
        glassEffectStyle="regular"
      >
        <View className="p-5">{children}</View>
      </GlassView>
    </View>
  );
}
