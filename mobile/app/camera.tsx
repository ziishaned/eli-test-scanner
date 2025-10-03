import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#9E9E9E" />
          <Text style={styles.permissionText}>
            Camera access is required to capture test strip photos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo) {
          // Navigate to preview screen with the photo URI
          router.push({
            pathname: "/preview" as any,
            params: { imageUri: photo.uri },
          });
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.topButton}
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera Frame Overlay */}
        <View style={styles.frameOverlay}>
          <View style={styles.frame} />
          <Text style={styles.frameText}>
            Position the test strip within the frame
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 32,
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  frame: {
    width: width - 80,
    height: (width - 80) * 0.7,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  frameText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
});
