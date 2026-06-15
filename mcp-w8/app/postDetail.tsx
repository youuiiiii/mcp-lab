import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  getPostComments,
  getPostDetail,
  getUserDetail,
} from "../services/api";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Comment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

export default function PostDetail() {
  const { id, userId } = useLocalSearchParams<{
    id?: string;
    userId?: string;
  }>();

  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const getDetailData = useCallback(async () => {
    try {
      const postId = Number(id);
      const postUserId = Number(userId);

      const [postRes, userRes, commentRes] = await Promise.all([
        getPostDetail(postId),
        getUserDetail(postUserId),
        getPostComments(postId),
      ]);

      if (postRes.status === 200) {
        setPost(postRes.data);
        console.log(postRes.data);
      } else {
        console.log("error");
      }

      if (userRes.status === 200) {
        setUser(userRes.data);
        console.log(userRes.data);
      } else {
        console.log("error");
      }

      if (commentRes.status === 200) {
        setComments(commentRes.data);
        console.log(commentRes.data);
      } else {
        console.log("error");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    if (id && userId) {
      getDetailData();
    }
  }, [getDetailData, id, userId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{post?.title}</Text>
      <Text style={styles.body}>{post?.body}</Text>

      <View style={styles.section}>
        <Text>Post Created By</Text>
        <Text>Name: {user?.name}</Text>
        <Text>Email: {user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.commentTitle}>Comments</Text>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            <Text style={styles.commentName}>{comment.name}</Text>
            <Text>Email: {comment.email}</Text>
            <Text>{comment.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  commentTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  commentCard: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 6,
    gap: 4,
  },
  commentName: {
    fontWeight: "bold",
  },
});
