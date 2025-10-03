import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { DateTime } from "luxon";
import { eliCodeToLabelMap } from "../src/constants";

const { width } = Dimensions.get("window");

interface SubmissionData {
  id: string;
  qr_code: string;
  original_image_path: string;
  image_size: number;
  image_dimensions: string;
  status: string;
  error_message: string | null;
  created_at: string;
  originalImageUrl: string;
}

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSubmissionDetails();
    }
  }, [id]);

  const loadSubmissionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://49c0ac3e2d43.ngrok-free.app/api/test-strips/${id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load submission details: ${response.status}`
        );
      }

      const data = await response.json();

      const transformedData: SubmissionData = {
        id: data.id,
        qr_code: data.qr_code,
        original_image_path: data.original_image_path,
        image_size: data.image_size,
        image_dimensions: data.image_dimensions,
        status: data.status,
        error_message: data.error_message,
        created_at: data.created_at,
        originalImageUrl: `https://49c0ac3e2d43.ngrok-free.app${data.originalImageUrl}`,
      };

      setSubmissionData(transformedData);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load submission details";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading submission details...</Text>
      </View>
    );
  }

  if (error || !submissionData) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>Failed to load submission</Text>
        <Text style={styles.errorSubtext}>
          {error || "Submission not found"}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadSubmissionDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return DateTime.fromISO(dateString).toFormat("MMM dd, yyyy 'at' h:mm a");
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#4CAF50";
      case "processing":
        return "#FF9800";
      case "failed":
        return "#F44336";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
      <Image
        contentFit="contain"
        style={styles.submissionImage}
        source={{ uri: submissionData.originalImageUrl }}
      />

      <View style={styles.detailsSection}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsContainer}>
            <Text style={styles.qrCode}>
              {eliCodeToLabelMap[submissionData.qr_code] ??
                eliCodeToLabelMap["No QR Code"]}
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>QR code</Text>
              <Text style={styles.detailValue}>
                {submissionData.qr_code ?? "-"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>
                {formatDate(submissionData.created_at)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dimensions</Text>
              <Text style={styles.detailValue}>
                {submissionData.image_dimensions}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>
                {formatFileSize(submissionData.image_size)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#F44336",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 12,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submissionImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 292,
    backgroundColor: "white",
    resizeMode: "contain",
    zIndex: 1,
  },
  detailsSection: {
    flex: 1,
    marginTop: 180,
    backgroundColor: "white",
    paddingTop: 20,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  dataContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  qrCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 16,
  },
  qrCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "monospace",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  imageInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  imageInfoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  detailsContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
});
