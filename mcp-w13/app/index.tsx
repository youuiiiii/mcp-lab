import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";
import { supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { addFailure, addSuccess } from "@/counter.slice";
import Counter from "@/Counter";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type Coordinates = {
  latitude: number;
  longitude: number;
};

type CapturedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
};

type CounterSnapshot = {
  success: number;
  failure: number;
};

const { height } = Dimensions.get("window");

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Permission not granted");
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId || projectId === "replace-with-your-eas-project-id") {
    throw new Error("Set EAS projectId in app.json");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export default function Index() {
  const [image, setImage] = useState<CapturedImage | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<string>("");
  const [expoPushToken, setExpoPushToken] = useState<string>("");

  const dispatch = useAppDispatch();
  const successCount = useAppSelector((state) => state.counter.success);
  const failureCount = useAppSelector((state) => state.counter.failure);
  const successRef = useRef(successCount);
  const failureRef = useRef(failureCount);

  useEffect(() => {
    successRef.current = successCount;
    failureRef.current = failureCount;
  }, [successCount, failureCount]);

  const recordSuccess = useCallback((message: string): CounterSnapshot => {
    const next = {
      success: successRef.current + 1,
      failure: failureRef.current,
    };

    successRef.current = next.success;
    dispatch(addSuccess(message));
    return next;
  }, [dispatch]);

  const recordFailure = useCallback((message: string): CounterSnapshot => {
    const next = {
      success: successRef.current,
      failure: failureRef.current + 1,
    };

    failureRef.current = next.failure;
    dispatch(addFailure(message));
    return next;
  }, [dispatch]);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        setExpoPushToken(token);
        recordSuccess("FCM push token created successfully.");
      })
      .catch((error) => {
        const message = error?.message ?? String(error);
        setExpoPushToken(message);
        recordFailure(`FCM push token failed: ${message}`);
      });
  }, [recordFailure, recordSuccess]);

  const showUploadNotification = async (
    title: string,
    message: string,
    uploadLocation: Coordinates | null,
    totals: CounterSnapshot
  ) => {
    const latitude = uploadLocation ? String(uploadLocation.latitude) : "-";
    const longitude = uploadLocation ? String(uploadLocation.longitude) : "-";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${message}\n${totals.success} successful, ${totals.failure} unsuccessful.\nLatitude: ${latitude}\nLongitude: ${longitude}`,
        data: {
          latitude,
          longitude,
          success: String(totals.success),
          failure: String(totals.failure),
        },
      },
      trigger: null,
    });
  };

  const getLocation = async (): Promise<Coordinates | null> => {
    const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

    if (permissionStatus !== "granted") {
      Alert.alert("Permission denied", "Please allow location access.");
      return null;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});
    const currentCoordinates = {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    };

    setLocation(currentCoordinates);
    return currentCoordinates;
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      await getLocation();
      setStatus("Camera capture is ready to upload.");
    }
  };

  const updateMarker = (coordinate: Coordinates) => {
    setLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const notifyFailure = async (
    message: string,
    uploadLocation: Coordinates | null
  ) => {
    const totals = recordFailure(message);

    try {
      await showUploadNotification(
        "Upload Failed",
        message,
        uploadLocation,
        totals
      );
      recordSuccess("FCM notification sent successfully.");
    } catch (notificationError: any) {
      recordFailure(notificationError?.message ?? "FCM notification failed.");
    }
  };

  const uploadToSupabase = async () => {
    if (!image) {
      Alert.alert("No Image", "Please capture an image first.");
      return;
    }

    let uploadLocation = location;

    if (!uploadLocation) {
      uploadLocation = await getLocation();

      if (!uploadLocation) {
        await notifyFailure("Location permission was not granted.", null);
        return;
      }
    }

    try {
      setStatus("Uploading image to Supabase...");

      const fileInfo = await FileSystem.getInfoAsync(image.uri);

      if (!fileInfo.exists) {
        await notifyFailure("Image file was not found.", uploadLocation);
        Alert.alert("Error", "Image file was not found.");
        setStatus("Image file was not found.");
        return;
      }

      const extension = image.fileName?.split(".").pop() ?? image.uri.split(".").pop() ?? "jpg";
      const fileName = `photo-${Date.now()}.${extension}`;
      const imageResponse = await fetch(image.uri);
      const imageArrayBuffer = await imageResponse.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("camera")
        .upload(fileName, imageArrayBuffer, {
          contentType: image.mimeType ?? "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      recordSuccess("Supabase Storage upload successful.");

      const { data: publicUrlData } = supabase.storage.from("camera").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("photo").insert([
        {
          latitude: String(uploadLocation.latitude),
          longitude: String(uploadLocation.longitude),
          image_url: publicUrlData.publicUrl,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      const totals = recordSuccess("Supabase photo data inserted successfully.");

      setStatus("Photo and location uploaded successfully.");

      try {
        await showUploadNotification(
          "Upload Success",
          "Photo data was inserted successfully.",
          uploadLocation,
          totals
        );
        recordSuccess("FCM notification sent successfully.");
      } catch (notificationError: any) {
        recordFailure(notificationError?.message ?? "FCM notification failed.");
      }

      Alert.alert("Success", "Photo and location uploaded successfully.");
    } catch (error: any) {
      console.log(error);
      setStatus("Failed to upload photo and location.");
      await notifyFailure(error?.message ?? "Failed to insert photo data.", uploadLocation);
      Alert.alert("Error", error?.message ?? "Failed to upload photo and location.");
    }
  };

  const region: Region | undefined = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Name - NIM</Text>
      <Counter />

      <View style={styles.button}>
        <Button title="GET GEO LOCATION" onPress={getLocation} />
      </View>

      <View style={styles.button}>
        <Button title="OPEN CAMERA" onPress={openCamera} />
      </View>

      <View style={styles.button}>
        <Button title="UPLOAD TO SUPABASE" onPress={uploadToSupabase} />
      </View>

      {image && <Image source={{ uri: image.uri }} style={styles.image} />}

      {location && region && (
        <>
          <MapView
            style={styles.map}
            region={region}
            onPress={(event) => updateMarker(event.nativeEvent.coordinate)}
          >
            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              coordinate={location}
              title="Photo Location"
              draggable
              onDragEnd={(event) => updateMarker(event.nativeEvent.coordinate)}
            />
          </MapView>

          <View style={styles.info}>
            <Text>Latitude: {location.latitude}</Text>
            <Text>Longitude: {location.longitude}</Text>
            <Text>Tap the map or drag the marker to update the photo location.</Text>
          </View>
        </>
      )}

      {status ? <Text style={styles.status}>{status}</Text> : null}
      {expoPushToken ? <Text style={styles.token}>Token: {expoPushToken}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    gap: 10,
  },
  title: {
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    width: 220,
  },
  image: {
    width: 250,
    height: 200,
    marginTop: 10,
  },
  map: {
    width: "100%",
    height: height * 0.45,
    marginTop: 10,
  },
  info: {
    width: "100%",
    padding: 12,
    gap: 6,
  },
  status: {
    marginTop: 8,
    textAlign: "center",
  },
  token: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 11,
  },
});
