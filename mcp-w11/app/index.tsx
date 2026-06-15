import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
  Alert,
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";
import { supabase } from "@/lib/supabase";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type CapturedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
};

const { height } = Dimensions.get("window");

export default function Index() {
  const [image, setImage] = useState<CapturedImage | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<string>("");

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

  const uploadToSupabase = async () => {
    if (!image) {
      Alert.alert("No Image", "Please capture an image first.");
      return;
    }

    let uploadLocation = location;

    if (!uploadLocation) {
      uploadLocation = await getLocation();

      if (!uploadLocation) {
        return;
      }
    }

    try {
      setStatus("Uploading image to Supabase...");

      const fileInfo = await FileSystem.getInfoAsync(image.uri);

      if (!fileInfo.exists) {
        Alert.alert("Error", "Image file was not found.");
        setStatus("Image file was not found.");
        return;
      }

      const extension = image.fileName?.split(".").pop() ?? image.uri.split(".").pop() ?? "jpg";
      const fileName = `photo-${Date.now()}.${extension}`;
      const filePath = fileName;
      const imageResponse = await fetch(image.uri);
      const imageArrayBuffer = await imageResponse.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("camera")
        .upload(filePath, imageArrayBuffer, {
          contentType: image.mimeType ?? "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from("camera").getPublicUrl(filePath);

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

      setStatus("Photo and location uploaded successfully.");
      Alert.alert("Success", "Photo and location uploaded successfully.");
    } catch (error: any) {
      console.log(error);
      setStatus("Failed to upload photo and location.");
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
});
