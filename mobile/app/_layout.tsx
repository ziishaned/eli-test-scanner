import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Test strip submissions" }}
      />
      <Stack.Screen
        name="details"
        options={{
          presentation: "modal",
          title: "Test strip details",
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          title: "Capture test strip",
        }}
      />
    </Stack>
  );
}
