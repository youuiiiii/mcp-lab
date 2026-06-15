import { Link } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import Animated, { FadeInRight } from "react-native-reanimated";
import styles from "./AppStyles";
import userData from "./data.json";

export default function userList() {
  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {userData.map((users, index) => (
        <Animated.View
          key={index}
          entering={FadeInRight.duration(500 + index * 300).delay(index * 100)}
        >
          <Link
            href={{
              pathname: "/profile",
              params: {
                userName: users.name,
                userEmail: users.email,
                userPhoto: users.photo_url,
              },
            }}
            push
            asChild
          >
            <TouchableOpacity activeOpacity={0.8}>
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <Avatar.Image size={70} source={{ uri: users.photo_url }} />
                  <View style={styles.textContainer}>
                    <Text variant="titleMedium" style={styles.cardText}>
                      {users.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.cardText}>
                      {users.email}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
