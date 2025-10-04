// Jest setup file for additional configuration

// Suppress console errors during tests
const originalError = console.error;
global.console.error = (...args) => {
  if (typeof args[0] === "string") {
    // Suppress act warnings for mocked async operations
    if (
      args[0].includes("An update to") &&
      args[0].includes("inside a test was not wrapped in act")
    ) {
      return;
    }

    // Suppress "Failed to load submissions" network errors
    if (args[0].includes("Failed to load submissions")) {
      return;
    }

    // Suppress React key warnings
    if (args[0].includes("Encountered two children with the same key")) {
      return;
    }
  }
  originalError.call(console, ...args);
};

// Mock react-native-vision-camera
jest.mock("react-native-vision-camera", () => ({
  Camera: "Camera",
  useCameraDevice: jest.fn(),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(),
  })),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ id: "1" })),
  useFocusEffect: jest.fn(),
}));

// Mock expo-image
jest.mock("expo-image", () => ({
  Image: "Image",
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

// Mock expo-status-bar
jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

// Mock luxon DateTime
jest.mock("luxon", () => ({
  DateTime: {
    fromJSDate: jest.fn(() => ({
      toLocaleString: jest.fn(() => "12/25/2023, 10:30 AM"),
    })),
    DATETIME_SHORT: "DATETIME_SHORT",
  },
}));

// Global test timeout
jest.setTimeout(10000);
