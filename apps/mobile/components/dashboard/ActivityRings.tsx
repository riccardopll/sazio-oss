import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface MacroData {
  consumed: number;
  goal: number;
}

interface ActivityRingsProps {
  calories: MacroData;
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
}

const RING_GAP = 8;
const STROKE_WIDTH = 18;
const OUTER_SIZE = 220;

const RINGS = [
  { key: "calories", color: "#FF2D55", label: "Calories", unit: "kcal" },
  { key: "protein", color: "#5AC8FA", label: "Protein", unit: "g" },
  { key: "carbs", color: "#4CD964", label: "Carbs", unit: "g" },
  { key: "fat", color: "#FFCC00", label: "Fat", unit: "g" },
] as const;

function RingArc({
  progress,
  radius,
  color,
  center,
}: {
  progress: number;
  radius: number;
  color: string;
  center: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={`${color}30`}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${center}, ${center}`}
      />
    </>
  );
}

export function ActivityRings({
  calories,
  protein,
  carbs,
  fat,
}: ActivityRingsProps) {
  const data = { calories, protein, carbs, fat };
  const center = OUTER_SIZE / 2;

  return (
    <View className="items-center">
      <View className="items-center justify-center">
        <Svg width={OUTER_SIZE} height={OUTER_SIZE}>
          {RINGS.map((ring, index) => {
            const ringData = data[ring.key];
            const progress =
              ringData.goal > 0 ? ringData.consumed / ringData.goal : 0;
            const radius =
              (OUTER_SIZE - STROKE_WIDTH) / 2 -
              index * (STROKE_WIDTH + RING_GAP);

            return (
              <RingArc
                key={ring.key}
                progress={progress}
                radius={radius}
                color={ring.color}
                center={center}
              />
            );
          })}
        </Svg>
      </View>

      <View className="flex-row flex-wrap justify-center gap-4 mt-6">
        {RINGS.map((ring) => {
          const ringData = data[ring.key];
          return (
            <View key={ring.key} className="flex-row items-center">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: ring.color }}
              />
              <Text className="text-sm">
                <Text className="font-semibold">
                  {Math.round(ringData.consumed)}
                </Text>
                <Text className="text-gray-500">
                  /{Math.round(ringData.goal)}
                  {ring.unit}
                </Text>
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
