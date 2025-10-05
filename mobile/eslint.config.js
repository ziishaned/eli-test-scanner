// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
        "dist/**",
        "build/**",
        "node_modules/**",
        "coverage/**",
        "*.log",
        ".env*",
        "babel.config.js",
        "jest.config.js"
    ],
  },
]);
