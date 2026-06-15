import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "index" }} />
      <Stack.Screen name="postDetail" options={{ title: "postDetail" }} />
      <Stack.Screen name="addPost" options={{ title: "addPost" }} />
    </Stack>
  );
}
