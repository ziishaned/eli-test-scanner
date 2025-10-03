import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useAppStore } from "../store/appStore";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const { addSubmission, setLoading, setError, isLoading, error } =
    useAppStore();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        if (photo) {
          setCapturedImage(photo.uri);
          setShowPreview(true);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        setError("Failed to capture image. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const submitImage = () => {
    if (capturedImage) {
      addSubmission({
        timestamp: new Date(),
        imageUri: capturedImage,
        qrCodeDetected: false,
        status: "pending",
      });

      setCapturedImage(null);
      setShowPreview(false);

      Alert.alert(
        "Success",
        "Image submitted successfully! You can view it in the History tab.",
        [{ text: "OK" }]
      );
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          {/* Camera Controls Overlay */}
          <View style={styles.overlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Center Guide */}
            <View style={styles.centerGuide}>
              <View style={styles.guideBorder}>
                <Text style={styles.guideText}>
                  Position test strip within frame
                </Text>
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isLoading && styles.captureButtonDisabled,
                ]}
                onPress={takePicture}
                disabled={isLoading}
              >
                <View style={styles.captureButtonInner}>
                  {isLoading ? (
                    <Ionicons name="hourglass" size={32} color="white" />
                  ) : (
                    <Ionicons name="camera" size={32} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={retakePhoto}
      >
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Preview</Text>
            <TouchableOpacity onPress={retakePhoto}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={retakePhoto}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={submitImage}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  errorText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topControls: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 12,
    borderRadius: 25,
  },
  centerGuide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  guideBorder: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    width: screenWidth * 0.8,
    height: screenHeight * 0.3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  guideText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    backgroundColor: "#007AFF",
    borderRadius: 40,
    padding: 4,
  },
  captureButtonDisabled: {
    backgroundColor: "#666",
  },
  captureButtonInner: {
    backgroundColor: "transparent",
    borderRadius: 36,
    padding: 16,
    borderWidth: 3,
    borderColor: "#fff",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  previewImage: {
    flex: 1,
    margin: 20,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  retakeButton: {
    backgroundColor: "#6C757D",
  },
  retakeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#28A745",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
