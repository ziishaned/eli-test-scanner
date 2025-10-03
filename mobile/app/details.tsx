import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { eliCodeToLabelMap, statusLabelMap } from "../constants";
import { StatusBar } from "expo-status-bar";
import { formatDate, formatFileSize } from "../src/utils/formatters";
import { getTestStripById, SubmissionData } from "../src/api/test-strips";
import { uploadsBaseURL } from "../src/api/client";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const loadSubmissionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTestStripById(id);
      setSubmissionData(data);
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
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSubmissionDetails();
    }
  }, [id, loadSubmissionDetails]);
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading submission details...</Text>
      </View>
    );
  }

  if (error || !submissionData) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>Failed to load submission</Text>
        <Text style={styles.errorSubtext}>
          {error || "Submission not found"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: 16,
            alignItems: "center",
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSubmissionDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        contentFit="contain"
        style={styles.submissionImage}
        source={{
          uri: `${uploadsBaseURL}/${submissionData.original_image_path}`,
        }}
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
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {statusLabelMap[submissionData.status]}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created at</Text>
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
    gap: 10,
    paddingTop: 16,
    backgroundColor: "white",
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
    height: 200,
    width: "100%",
    resizeMode: "contain",
    backgroundColor: "white",
  },
  detailsSection: {
    flex: 1,
    backgroundColor: "white",
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  qrCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  },
});
