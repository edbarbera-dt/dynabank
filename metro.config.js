const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath:
    require.resolve("@dynatrace/react-native-plugin/lib/dynatrace-transformer"),
};

config.reporter = require("@dynatrace/react-native-plugin/lib/dynatrace-reporter");

module.exports = withNativeWind(config, { input: "./src/global.css" });

