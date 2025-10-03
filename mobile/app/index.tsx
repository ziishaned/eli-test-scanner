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
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { DateTime } from "luxon";
import { Submission, SubmissionStatus, Quality } from "./types";

const { width } = Dimensions.get("window");

export default function Index() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setLoading(true);
      }

      const res = await fetch(
        `https://49c0ac3e2d43.ngrok-free.app/api/test-strips?page=${pageNum}&limit=20`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const resJSON = await res.json();

      if (append) {
        setSubmissions((prev) => [...prev, ...resJSON.data]);
      } else {
        setSubmissions(resJSON.data);
      }

      // Update pagination state
      setPage(resJSON.pagination.page);
      setHasNextPage(resJSON.pagination.page < resJSON.pagination.total_pages);
      setIsOffline(false);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setIsOffline(true);
      Alert.alert(
        "Error",
        "Failed to load submissions. Please check your connection and make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMoreSubmissions = async () => {
    if (!hasNextPage || loading) return;

    setLoading(true);
    await loadSubmissions(page + 1, true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasNextPage(true);
    await loadSubmissions(1, false);
    setRefreshing(false);
  };

  const getQRCodeStatus = (submission: any) => {
    const { status, qr_code } = submission;
    const qrCodeValid = qr_code && status === "completed";

    if (status === "processing") {
      return { icon: "scan-outline", color: "#9E9E9E", text: "Processing..." };
    }

    if (status === "qr_not_found") {
      return { color: "#F44336", text: "No QR code found" };
    }

    if (status === "qr_invalid") {
      return { color: "#F44336", text: "QR code invalid" };
    }

    if (status === "qr_expired") {
      return { color: "#FF5722", text: "QR code expired" };
    }

    if (status === "failed") {
      return { color: "#F44336", text: "Processing failed" };
    }

    if (qr_code && qrCodeValid) {
      return { color: "#4CAF50", text: `QR: ${qr_code}` };
    }

    return { color: "#9E9E9E", text: "Unknown status" };
  };

  const renderSubmissionItem = ({ item }: { item: any }) => {
    const qrStatus = getQRCodeStatus(item);

    return (
      <TouchableOpacity
        style={styles.submissionItem}
        onPress={() => router.push(`/details?id=${item.id}`)}
      >
        <Image
          source={{
            uri: item.thumbnail_url
              ? `https://49c0ac3e2d43.ngrok-free.app${item.thumbnail_url}`
              : undefined,
          }}
          style={styles.thumbnail}
        />

        <View style={styles.submissionInfo}>
          <View style={styles.qrCodeMainRow}>
            <Ionicons
              name={qrStatus.icon as any}
              size={18}
              color={qrStatus.color}
            />
            <Text style={[styles.qrCodeMainText, { color: qrStatus.color }]}>
              {item.qr_code ? item.qr_code : "No QR code"}
            </Text>
          </View>

          {item.qr_code && (
            <View style={styles.statusDetailRow}>
              <Text style={styles.statusText}>
                Status:{" "}
                {item.qr_code && item.status === "completed"
                  ? "Valid"
                  : "Expired"}
              </Text>
            </View>
          )}

          {item.qr_code && (
            <View style={styles.qualityRow}>
              <Text style={styles.qualityText}>
                Quality:{" "}
                {item.quality
                  ? item.quality.charAt(0).toUpperCase() + item.quality.slice(1)
                  : "Unknown"}
              </Text>
            </View>
          )}

          {item.created_at && (
            <View style={styles.processedRow}>
              <Text style={styles.processedText}>
                Processed:{" "}
                {DateTime.fromJSDate(new Date(item.created_at)).toLocaleString(
                  DateTime.DATETIME_SHORT
                )}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!hasNextPage && !loading) return null;

    if (loading) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }

    if (hasNextPage) {
      return (
        <View style={styles.footerLoader}>
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={loadMoreSubmissions}
            disabled={loading}
          >
            <Text style={styles.loadMoreButtonText}>Load more</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  if (isOffline) {
    return (
      <View style={styles.offlineContainer}>
        <StatusBar style="dark" />
        <Ionicons name="wifi-outline" size={64} color="#9E9E9E" />
        <Text style={styles.offlineText}>You're offline</Text>
        <Text style={styles.offlineSubtext}>
          Please check your internet connection and try again
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadSubmissions()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <FlatList
        data={submissions}
        renderItem={renderSubmissionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContainer,
          submissions.length === 0 && styles.emptyListContainer,
        ]}
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
  emptyListContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: "center",
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
    alignItems: "center",
    paddingHorizontal: 32,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 14,
  },
  loadMoreButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  loadMoreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
