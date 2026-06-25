const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  timeout: 15000,
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
  },
});
