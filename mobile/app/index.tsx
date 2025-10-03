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
import { Submission, QRCodeData } from "./types";

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
      timestamp: new Date("2024-10-01T10:30:00"),
      qrCode: { detected: true, content: "QR12345", confidence: 0.95 },
      status: "processed",
    },
    {
      id: "2",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: new Date("2024-10-01T09:15:00"),
      qrCode: { detected: false },
      status: "processed",
    },
    {
      id: "3",
      imageUri: "https://placehold.jp/200x200.png",
      timestamp: new Date("2024-09-30T16:45:00"),
      qrCode: null,
      status: "pending",
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

  const getStatusIcon = (status: Submission["status"]) => {
    switch (status) {
      case "processed":
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case "pending":
        return <Ionicons name="time-outline" size={24} color="#FF9800" />;
      case "error":
        return <Ionicons name="alert-circle" size={24} color="#F44336" />;
      default:
        return <Ionicons name="help-circle" size={24} color="#9E9E9E" />;
    }
  };

  const getQRCodeStatus = (qrCode: QRCodeData | null) => {
    if (!qrCode) {
      return { icon: "scan-outline", color: "#9E9E9E", text: "Processing..." };
    }

    if (qrCode.detected) {
      return {
        icon: "qr-code",
        color: "#4CAF50",
        text: `QR: ${qrCode.content}`,
      };
    } else {
      return {
        icon: "scan-outline",
        color: "#F44336",
        text: "No QR Code",
      };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return (
      timestamp.toLocaleDateString() +
      " " +
      timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => {
    const qrStatus = getQRCodeStatus(item.qrCode);

    return (
      <TouchableOpacity style={styles.submissionItem}>
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />

        <View style={styles.submissionInfo}>
          <View style={styles.statusRow}>
            {getStatusIcon(item.status)}
            <Text style={styles.timestampText}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          <View style={styles.qrRow}>
            <Ionicons
              name={qrStatus.icon as any}
              size={16}
              color={qrStatus.color}
            />
            <Text style={[styles.qrText, { color: qrStatus.color }]}>
              {qrStatus.text}
            </Text>
          </View>

          {item.qrCode?.confidence && (
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(item.qrCode.confidence * 100)}%
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isOffline) {
    return (
      <SafeAreaView style={styles.offlineContainer}>
        <Ionicons name="wifi-outline" size={64} color="#9E9E9E" />
        <Text style={styles.offlineText}>You're offline</Text>
        <Text style={styles.offlineSubtext}>
          Please check your internet connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSubmissions}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
    justifyContent: "space-between",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
});
