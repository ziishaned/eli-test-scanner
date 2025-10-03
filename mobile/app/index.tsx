import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { eliCodeToLabelMap, statusLabelMap } from "../constants";
import { formatDate } from "../src/utils/formatters";
import { getTestStrips, SubmissionData } from "../src/api/test-strips";
import { uploadsBaseURL } from "../src/api/client";

export default function Index() {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
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
      if (!append) setLoading(true);

      const result = await getTestStrips(pageNum, 20);

      if (append) {
        setSubmissions((prev) => [...prev, ...result.data]);
      } else {
        setSubmissions(result.data);
      }

      setPage(result.pagination.page);
      setHasNextPage(result.pagination.page < result.pagination.total_pages);
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

  const renderSubmissionItem = ({ item }: { item: SubmissionData }) => {
    return (
      <TouchableOpacity
        style={styles.submissionItem}
        onPress={() => router.push(`/details?id=${item.id}`)}
      >
        <Image
          source={{
            uri: item.thumbnail_path
              ? `${uploadsBaseURL}/${item.thumbnail_path}`
              : undefined,
          }}
          style={styles.thumbnail}
        />

        <View style={styles.submissionInfo}>
          <Text style={styles.qrCodeMainText}>
            {eliCodeToLabelMap[item.qr_code] ?? eliCodeToLabelMap["No QR Code"]}
          </Text>

          {item.qr_code && (
            <Text style={styles.statusText}>QR code: {item.qr_code}</Text>
          )}

          {item.status && (
            <Text style={styles.statusText}>
              Status: {statusLabelMap[item.status]}
            </Text>
          )}

          {item.created_at && (
            <Text style={styles.processedText}>
              Created at: {formatDate(item.created_at)}
            </Text>
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
        <Text style={styles.offlineText}>You are offline</Text>
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
    gap: 6,
    justifyContent: "center",
  },
  qrCodeMainText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
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
