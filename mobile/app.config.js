const { colors } = require("./theme.json");

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  name: "sazio-oss",
  slug: "sazio-oss",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "saziooss",
  userInterfaceStyle: "dark",
  splash: {
    backgroundColor: colors.surface.app,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.sazio-oss",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: colors.surface.app,
    },
    package: "com.anonymous.saziooss",
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    "@clerk/expo",
    "@react-native-community/datetimepicker",
    "expo-web-browser",
    "expo-image",
    "expo-secure-store",
  ],
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
};
