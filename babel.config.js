module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          jsxImportSource: "@dynatrace/react-native-plugin",
        },
      ],
      "nativewind/babel",
    ],
  };
};

