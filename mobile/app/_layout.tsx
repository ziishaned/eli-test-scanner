import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "History" }} />
      <Stack.Screen
        name="details"
        options={{
          presentation: "modal",
          title: "Details",
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "modal",
          title: "Camera",
        }}
      />
    </Stack>
  );
}
