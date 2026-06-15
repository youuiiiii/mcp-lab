import { Link, useLocalSearchParams } from "expo-router";
import { Button, Text, View } from "react-native";
import { Avatar } from "react-native-paper";
import styles from "./AppStyles";

export default function Profile() {
  const { userName, userEmail, userPhoto } = useLocalSearchParams<{
    userName: string;
    userEmail: string;
    userPhoto: string;
  }>();

  return (
    <View style={styles.profileContainer}>
      <Avatar.Image size={70} source={{ uri: userPhoto }} />
      <Text>{userName}&apos;s Profile</Text>
      <Text>{userEmail}</Text>
      <Link href="/home" push asChild>
        <Button title="Go to Home Screen" />
      </Link>
    </View>
  );
}
