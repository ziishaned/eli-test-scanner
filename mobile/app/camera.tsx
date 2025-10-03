import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">(
    "back"
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(cameraPosition);

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setCameraPosition((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto();

        if (photo) {
          setCapturedImage(
            photo.path.startsWith("file://")
              ? photo.path
              : `file://${photo.path}`
          );
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to capture photo. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      Alert.alert(
        "Submitting...",
        "Your test strip photo is being processed.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("./");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting image:", error);
      Alert.alert("Error", "Failed to submit photo. Please try again.");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    router.replace("./");
  };

  return (
    <View style={[styles.container, capturedImage && styles.previewContainer]}>
      {capturedImage ? (
        <View style={{ flex: 1 }}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: capturedImage }}
              style={[styles.previewImage, { borderRadius: 12 }]}
              contentFit="contain"
            />
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetake}
            >
              <Text style={styles.secondaryButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraViewContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              device={device}
              isActive={true}
              photo={true}
            >
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

              <View style={styles.frameOverlay}>
                <View style={styles.frame} />
                <Text style={styles.frameText}>
                  Position the test strip within the frame
                </Text>
              </View>
            </Camera>
          </View>

          <View style={styles.bottomControlsArea}>
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  previewContainer: {
    backgroundColor: "#f5f5f5",
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraViewContainer: {
    flex: 1,
    position: "relative",
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
  bottomControlsArea: {
    height: 120,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  bottomControls: {
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(0, 0, 0, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    marginVertical: 10,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
