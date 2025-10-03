import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { useAppStore } from "../store/appStore";
import { TestSubmission } from "../types";
import { Ionicons } from "@expo/vector-icons";

const { width: screenWidth } = Dimensions.get("window");

export default function HistoryScreen() {
  const { submissions, isLoading, setLoading, error, clearError } =
    useAppStore();

  const onRefresh = useCallback(async () => {
    setLoading(true);
    clearError();

    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [setLoading, clearError]);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const getStatusIcon = (submission: TestSubmission) => {
    switch (submission.status) {
      case "processed":
        return submission.qrCodeDetected ? "checkmark-circle" : "alert-circle";
      case "error":
        return "close-circle";
      case "pending":
      default:
        return "time";
    }
  };

  const getStatusColor = (submission: TestSubmission) => {
    switch (submission.status) {
      case "processed":
        return submission.qrCodeDetected ? "#28A745" : "#FFC107";
      case "error":
        return "#DC3545";
      case "pending":
      default:
        return "#6C757D";
    }
  };

  const getStatusText = (submission: TestSubmission) => {
    switch (submission.status) {
      case "processed":
        return submission.qrCodeDetected
          ? `QR Code Detected: ${submission.qrCodeData}`
          : "No QR Code Found";
      case "error":
        return submission.errorMessage || "Processing Error";
      case "pending":
      default:
        return "Processing...";
    }
  };

  const handleSubmissionPress = (submission: TestSubmission) => {
    Alert.alert(
      "Submission Details",
      `Timestamp: ${formatTimestamp(submission.timestamp)}\n` +
        `Status: ${getStatusText(submission)}\n` +
        `ID: ${submission.id}`,
      [{ text: "OK" }]
    );
  };

  const renderSubmissionItem = ({ item }: { item: TestSubmission }) => (
    <TouchableOpacity
      style={styles.submissionCard}
      onPress={() => handleSubmissionPress(item)}
    >
      <View style={styles.cardContent}>
        {/* Image */}
        <Image
          source={{ uri: item.imageUri }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />

        {/* Content */}
        <View style={styles.submissionInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item) },
              ]}
            >
              <Ionicons
                name={getStatusIcon(item) as any}
                size={16}
                color="#fff"
              />
            </View>
          </View>

          <Text style={styles.statusText} numberOfLines={2}>
            {getStatusText(item)}
          </Text>

          {item.qrCodeDetected && item.qrCodeData && (
            <View style={styles.qrCodeContainer}>
              <Ionicons name="qr-code" size={16} color="#007AFF" />
              <Text style={styles.qrCodeText} numberOfLines={1}>
                {item.qrCodeData}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="camera-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>No Submissions Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Take a photo using the camera tab to get started
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Submission History</Text>
      <Text style={styles.headerSubtitle}>
        {submissions.length}{" "}
        {submissions.length === 1 ? "submission" : "submissions"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#fff" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={submissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          submissions.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title="Pull to refresh"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  errorBanner: {
    backgroundColor: "#DC3545",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 44, // Account for status bar
  },
  errorText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6C757D",
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1D1D1F",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 22,
  },
  submissionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
  },
  submissionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#6C757D",
    lineHeight: 20,
    marginBottom: 8,
  },
  qrCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  qrCodeText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    flex: 1,
  },
});
