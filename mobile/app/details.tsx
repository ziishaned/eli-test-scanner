import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DateTime } from "luxon";

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
  quality: string;
}

export default function DetailsScreen() {
  // Mock data - in a real app, this would come from props or API
  const submissionData: SubmissionData = {
    id: "ee323ad2-5c4f-4f91-a228-6a5132529692",
    qr_code: "ELI-2025-001",
    original_image_path: "3f6d5e61-52f7-4532-b3cf-533a4a9cea02.png",
    image_size: 8510,
    image_dimensions: "278x258",
    status: "completed",
    error_message: null,
    created_at: "2025-10-02T23:59:35.378Z",
    originalImageUrl: "https://i.imgur.com/u6XMzPk.png",
    quality: "good",
  };

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

  const getQualityColor = (quality: string): string => {
    switch (quality.toLowerCase()) {
      case "good":
        return "#4CAF50";
      case "fair":
        return "#FF9800";
      case "poor":
        return "#F44336";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
      {/* Full Width Image - Absolute positioned */}
      <Image
        source={{ uri: submissionData.originalImageUrl }}
        style={styles.submissionImage}
        contentFit="contain"
      />

      {/* Details Section */}
      <View style={styles.detailsSection}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dataContainer}>
            {/* QR Code */}
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrCode}>{submissionData.qr_code}</Text>
              <View style={styles.qrIconContainer}>
                <Ionicons name="qr-code" size={20} color="#007AFF" />
              </View>
            </View>

            {/* Status and Quality */}
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(submissionData.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(submissionData.status) },
                  ]}
                >
                  {submissionData.status.charAt(0).toUpperCase() +
                    submissionData.status.slice(1)}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: getQualityColor(submissionData.quality),
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.qualityText,
                    { color: getQualityColor(submissionData.quality) },
                  ]}
                >
                  {submissionData.quality.charAt(0).toUpperCase() +
                    submissionData.quality.slice(1)}
                </Text>
              </View>
            </View>

            {/* Image Info */}
            <View style={styles.imageInfoRow}>
              <Text style={styles.imageInfoText}>
                {submissionData.image_dimensions}
              </Text>
              <Text style={styles.imageInfoText}>
                {formatFileSize(submissionData.image_size)}
              </Text>
            </View>

            {/* Details without ID */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {formatDate(submissionData.created_at)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>File</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {submissionData.original_image_path}
                </Text>
              </View>
              {submissionData.error_message && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Error</Text>
                  <Text style={[styles.detailValue, styles.errorText]}>
                    {submissionData.error_message}
                  </Text>
                </View>
              )}
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
  submissionImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 180,
    backgroundColor: "white",
    resizeMode: "contain",
    zIndex: 1,
  },
  detailsSection: {
    flex: 1,
    marginTop: 180, // Start after image with slight overlap
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
  qrIconContainer: {
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 6,
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
  qualityText: {
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
  errorText: {
    color: "#F44336",
  },
});
