import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function PreviewScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const handleSubmit = async () => {
    try {
      // Here you would typically upload the image to your backend
      // For now, we'll just simulate the submission
      Alert.alert(
        "Submitting...",
        "Your test strip photo is being processed.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to home screen
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
    // Go back to camera screen
    router.back();
  };

  const handleClose = () => {
    // Discard the image and go back to home
    router.replace("./");
  };

  if (!imageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>No image to preview</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("./")}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Image Preview */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.previewImage}
          contentFit="contain"
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Please review the captured image. Make sure the test strip is clearly
          visible and well-lit.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
          <Ionicons name="camera" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  imageContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  instructionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
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
    gap: 8,
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
    gap: 8,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F44336",
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
