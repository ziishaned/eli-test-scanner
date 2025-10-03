import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { TestSubmission } from '../types';

// Mock data for demonstration
const mockSubmissions: TestSubmission[] = [
  {
    id: '1',
    imagePath: 'https://via.placeholder.com/150',
    timestamp: new Date('2024-01-15T10:30:00'),
    qrCode: 'QR12345',
    status: 'processed',
  },
  {
    id: '2',
    imagePath: 'https://via.placeholder.com/150',
    timestamp: new Date('2024-01-14T14:22:00'),
    qrCode: 'QR67890',
    status: 'processed',
  },
  {
    id: '3',
    imagePath: 'https://via.placeholder.com/150',
    timestamp: new Date('2024-01-13T09:15:00'),
    status: 'pending',
  },
  {
    id: '4',
    imagePath: 'https://via.placeholder.com/150',
    timestamp: new Date('2024-01-12T16:45:00'),
    status: 'error',
  },
];

const HistoryScreen: React.FC = () => {
  const [submissions, setSubmissions] =
    useState<TestSubmission[]>(mockSubmissions);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Implement actual data fetching from backend/store
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      // Simulate adding a new submission
      const newSubmission: TestSubmission = {
        id: Date.now().toString(),
        imagePath: 'https://via.placeholder.com/150',
        timestamp: new Date(),
        status: 'pending',
      };
      setSubmissions(prev => [newSubmission, ...prev]);
    } catch (error) {
      console.error('Failed to refresh:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getStatusColor = (status: TestSubmission['status']): string => {
    switch (status) {
      case 'processed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: TestSubmission['status']): string => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'pending':
        return 'Processing...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSubmissionItem = ({ item }: { item: TestSubmission }) => (
    <TouchableOpacity style={styles.submissionItem}>
      <Image source={{ uri: item.imagePath }} style={styles.submissionImage} />
      <View style={styles.submissionDetails}>
        <Text style={styles.submissionId}>ID: {item.id}</Text>
        <Text style={styles.submissionDate}>{formatDate(item.timestamp)}</Text>
        {item.qrCode && <Text style={styles.qrCode}>QR: {item.qrCode}</Text>}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No submissions yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Go to the Scanner tab to capture your first test strip
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={submissions}
        renderItem={renderSubmissionItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={
          submissions.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  submissionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submissionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  submissionDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  submissionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submissionDate: {
    fontSize: 14,
    color: '#6c757d',
    marginVertical: 4,
  },
  qrCode: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HistoryScreen;
