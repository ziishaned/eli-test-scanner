import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Test strip submissions" }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          headerShown: false,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
