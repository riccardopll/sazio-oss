import theme from "../theme.json";

export const mobileTheme = theme.colors;

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
