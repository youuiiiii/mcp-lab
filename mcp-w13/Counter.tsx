import { StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "./hooks";

export default function Counter() {
  const success = useAppSelector((state) => state.counter.success);
  const failure = useAppSelector((state) => state.counter.failure);
  const lastMessage = useAppSelector((state) => state.counter.lastMessage);

  return (
    <View style={styles.container}>
      <Text>Successful: {success}</Text>
      <Text>Unsuccessful: {failure}</Text>
      {lastMessage ? <Text style={styles.message}>{lastMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  message: {
    textAlign: "center",
  },
});
