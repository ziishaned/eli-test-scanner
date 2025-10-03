import React, { useState, useEffect, useCallback } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DateTime } from "luxon";
import { Submission, SubmissionStatus, Quality } from "./types";

const { width } = Dimensions.get("window");

export default function Index() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Mock data for demonstration - replace with actual API calls
  const mockSubmissions: Submission[] = [
    {
      id: "1",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: DateTime.fromISO("2024-10-01T10:30:00").toJSDate(),
      qrCode: "ELI-2025-001",
      qrCodeValid: true,
      status: "completed",
      quality: "basic brightness",
      processedAt: DateTime.fromISO("2024-10-01T10:30:00").toJSDate(),
    },
    {
      id: "2",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: DateTime.fromISO("2024-10-01T09:15:00").toJSDate(),
      qrCode: "ELI-2025-002",
      qrCodeValid: true,
      status: "completed",
      quality: "blur detection",
      processedAt: DateTime.fromISO("2024-10-01T09:15:00").toJSDate(),
    },
    {
      id: "3",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: DateTime.fromISO("2024-09-30T16:45:00").toJSDate(),
      qrCode: "ELI-2024-999",
      qrCodeValid: false,
      status: "qr_expired",
      quality: "basic brightness",
      processedAt: DateTime.fromISO("2024-09-30T16:45:00").toJSDate(),
    },
    {
      id: "4",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: DateTime.fromISO("2024-09-30T14:20:00").toJSDate(),
      status: "qr_not_found",
      quality: "failed",
      processedAt: DateTime.fromISO("2024-09-30T14:20:00").toJSDate(),
    },
  ];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissions(mockSubmissions);
      setIsOffline(false);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setIsOffline(true);
      Alert.alert(
        "Error",
        "Failed to load submissions. Please check your connection."
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubmissions();
    setRefreshing(false);
  }, []);

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case "completed":
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case "processing":
        return <Ionicons name="time-outline" size={24} color="#FF9800" />;
      case "failed":
        return <Ionicons name="alert-circle" size={24} color="#F44336" />;
      case "qr_not_found":
        return <Ionicons name="scan-outline" size={24} color="#FF9800" />;
      case "qr_invalid":
        return <Ionicons name="close-circle" size={24} color="#F44336" />;
      case "qr_expired":
        return <Ionicons name="time" size={24} color="#FF5722" />;
      default:
        return <Ionicons name="help-circle" size={24} color="#9E9E9E" />;
    }
  };

  const getQRCodeStatus = (submission: Submission) => {
    const { status, qrCode, qrCodeValid } = submission;

    if (status === "processing") {
      return { icon: "scan-outline", color: "#9E9E9E", text: "Processing..." };
    }

    if (status === "qr_not_found") {
      return {
        icon: "scan-outline",
        color: "#F44336",
        text: "No QR Code Found",
      };
    }

    if (status === "qr_invalid") {
      return {
        icon: "close-circle",
        color: "#F44336",
        text: "Invalid QR Code",
      };
    }

    if (status === "qr_expired") {
      return { icon: "time", color: "#FF5722", text: "QR Code Expired" };
    }

    if (status === "failed") {
      return {
        icon: "alert-circle",
        color: "#F44336",
        text: "Processing Failed",
      };
    }

    if (qrCode && qrCodeValid) {
      return {
        icon: "qr-code",
        color: "#4CAF50",
        text: `QR: ${qrCode}`,
      };
    }

    return { icon: "scan-outline", color: "#9E9E9E", text: "Unknown Status" };
  };

  const formatTimestamp = (timestamp: Date) => {
    return DateTime.fromJSDate(timestamp).toRelative();
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => {
    const qrStatus = getQRCodeStatus(item);

    return (
      <TouchableOpacity style={styles.submissionItem}>
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />

        <View style={styles.submissionInfo}>
          <View style={styles.qrCodeMainRow}>
            <Ionicons
              name={qrStatus.icon as any}
              size={18}
              color={qrStatus.color}
            />
            <Text style={[styles.qrCodeMainText, { color: qrStatus.color }]}>
              {item.qrCode ? item.qrCode : "No QR code"}
            </Text>
          </View>

          {item.qrCode && (
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusText}>
                Status: {item.qrCodeValid ? "Valid" : "Expired"}
              </Text>
            </View>
          )}

          {item.qrCode && (
            <View style={styles.qualityRow}>
              <Text style={styles.qualityText}>
                Quality:{" "}
                {item.quality
                  ? item.quality.charAt(0).toUpperCase() + item.quality.slice(1)
                  : "Unknown"}
              </Text>
            </View>
          )}

          {item.processedAt && (
            <View style={styles.processedRow}>
              <Text style={styles.processedText}>
                Processed:{" "}
                {DateTime.fromJSDate(item.processedAt).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isOffline) {
    return (
      <>
        <Ionicons name="wifi-outline" size={64} color="#9E9E9E" />
        <Text style={styles.offlineText}>You're offline</Text>
        <Text style={styles.offlineSubtext}>
          Please check your internet connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSubmissions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <>
      <FlatList
        data={submissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={64} color="#9E9E9E" />
            <Text style={styles.emptyText}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Start by capturing a test strip photo
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/camera" as any)}
      >
        <Ionicons name="camera" size={28} color="white" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  submissionItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  submissionInfo: {
    flex: 1,
  },
  qrCodeMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  qrCodeMainText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDetailRow: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  timestampText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  qrRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  qrText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  qrValidRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  qrValidText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  qualityRow: {
    marginBottom: 8,
  },
  qualityText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  processedRow: {
    marginBottom: 0,
  },
  processedText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  confidenceText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 32,
  },
  offlineText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  offlineSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
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
  fab: {
    position: "absolute",
    bottom: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});
