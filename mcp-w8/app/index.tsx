import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getPosts } from "../services/api";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts();
  }, []);

  const getAllPosts = async () => {
    try {
      const res = await getPosts();
      if (res.status === 200) {
        setPosts(res.data);
        console.log(res.data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.addButton} onPress={() => router.push("/addPost")}>
        <Text style={styles.addButtonText}>Add New Post</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {posts.map((post) => (
            <Pressable
              key={post.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/postDetail",
                  params: {
                    id: String(post.id),
                    userId: String(post.userId),
                  },
                })
              }
            >
              <Text>Post Number: {post.id}</Text>
              <Text>Title: {post.title}</Text>
              <Text>Body: {post.body}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#111827",
    margin: 12,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 6,
    gap: 4,
  },
});
