import theme from "../theme.json";

export const mobileTheme = theme.colors;

export const glassTints = {
  sheet: "rgba(24, 24, 28, 0.72)",
  tabBar: "rgba(18, 18, 20, 0.62)",
} as const;

export const nutritionTheme = {
  calories: {
    color: mobileTheme.nutrition.calories,
  },
  carbs: {
    color: mobileTheme.nutrition.carbs,
  },
  fat: {
    color: mobileTheme.nutrition.fat,
  },
  protein: {
    color: mobileTheme.nutrition.protein,
  },
} as const;

export const navigationTheme = {
  dark: true,
  colors: {
    primary: mobileTheme.accent.brand,
    background: mobileTheme.surface.app,
    card: mobileTheme.surface.app,
    text: mobileTheme.text.primary,
    border: mobileTheme.border.subtle,
    notification: mobileTheme.accent.brand,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400" as const,
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500" as const,
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700" as const,
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "800" as const,
    },
  },
} as const;
