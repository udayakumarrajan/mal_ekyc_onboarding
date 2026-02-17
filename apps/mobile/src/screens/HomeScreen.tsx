import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useVerificationStore } from '../stores/verificationStore';
import { useTheme } from '../theme';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GradientBackground } from '../components/common/GradientBackground';
import { apiClient } from '../services/api/client';

const HomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const user = useAuthStore((state) => state.user);
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  
  const { 
    status, 
    loading, 
    isPolling,
    fetchStatus, 
    startPolling, 
    stopPolling,
    resetPollInterval 
  } = useVerificationStore();

  const hasStartedPolling = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  // Refetch status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[HomeScreen] Screen focused, fetching status');
      // Fetch status whenever screen is focused
      const refreshStatus = async () => {
        await fetchStatus();
      };
      
      refreshStatus();
      

      // Cleanup on unmount or screen blur
      return () => {
        console.log('[HomeScreen] Screen blurred, cleaning up');
        stopPolling();
        hasStartedPolling.current = false;
      };
    }, [])
  );

  // Start polling based on status changes
  useEffect(() => {
    console.log('[HomeScreen] Status changed:', status?.status, 'isPolling:', isPolling);
    const shouldPoll = 
      status?.status === 'IN_PROGRESS' || 
      status?.status === 'MANUAL_REVIEW';
    
    if (shouldPoll && !isPolling && !hasStartedPolling.current) {
      console.log('[HomeScreen] Starting polling');
      hasStartedPolling.current = true;
      resetPollInterval();
      startPolling(() => {
        // Callback for UI updates if needed
      });
    }

    if (!shouldPoll && hasStartedPolling.current) {
      console.log('[HomeScreen] Stopping polling');
      stopPolling();
      hasStartedPolling.current = false;
    }
  }, [status?.status, isPolling]);

  const loadData = async () => {
    try {
      setLoadingUser(true);
      // Fetch user info
      const response = await apiClient.get('/v1/me');
      setUserInfo(response.data);
      
      // Fetch verification status
      await fetchStatus();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartOnboarding = () => {
    navigation.navigate('Onboarding' as never);
  };

  const handleProcessVerification = async () => {
    try {
      Alert.alert(
        'Process Verification',
        'This will simulate the verification processing. Status will change to APPROVED, MANUAL_REVIEW, or REJECTED.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Process',
            onPress: async () => {
              try {
                await apiClient.post('/v1/verification/process');
                await fetchStatus();
                Alert.alert('Success', 'Verification processing completed!');
              } catch (error: any) {
                Alert.alert('Error', error?.error?.message || 'Failed to process verification');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loadingUser) {
    return <LoadingSpinner />;
  }

  const getStatusColor = () => {
    switch (status?.status) {
      case 'APPROVED':
        return theme.colors.success;
      case 'REJECTED':
        return theme.colors.error;
      case 'IN_PROGRESS':
      case 'MANUAL_REVIEW':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status?.status) {
      case 'NOT_STARTED':
        return 'Not Started';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'MANUAL_REVIEW':
        return 'Under Review';
      default:
        return 'Unknown';
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.greeting, { color: theme.colors.text, fontSize: theme.typography.fontSize.large }]}>
            Welcome, {userInfo?.fullName || user?.fullName || 'User'}!
          </Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.regular }]}>
            {userInfo?.email || user?.email}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.typography.fontSize.large }]}>
              Verification Status
            </Text>
            {isPolling && (
              <Text style={[styles.pollingIndicator, { color: theme.colors.primary, fontSize: theme.typography.fontSize.small }]}>
                ● Updating...
              </Text>
            )}
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          {status?.updatedAt && (
            <Text style={[styles.updatedAt, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small }]}>
              Last updated: {new Date(status.updatedAt).toLocaleString()}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {(status?.status === 'NOT_STARTED' || !status) && (
            <Button title="Start Onboarding" onPress={handleStartOnboarding} />
          )}
          {status?.status === 'IN_PROGRESS' && (
            <>
              <Button title="Process Verification (Demo)" onPress={handleProcessVerification} />
              <View style={{ height: 12 }} />
              <Button title="Continue Onboarding" onPress={handleStartOnboarding} variant="secondary" />
            </>
          )}
          {status?.status === 'MANUAL_REVIEW' && (
            <View style={[styles.infoCard, { backgroundColor: theme.colors.warning + '20' }]}>
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                Your verification is under manual review. We'll update you soon.
              </Text>
            </View>
          )}
          {status?.status === 'APPROVED' && (
            <View style={[styles.infoCard, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.infoText, { color: theme.colors.success }]}>
                ✓ Your verification has been approved!
              </Text>
            </View>
          )}
          {status?.status === 'REJECTED' && (
            <>
              <View style={[styles.infoCard, { backgroundColor: theme.colors.error + '20' }]}>
                <Text style={[styles.infoText, { color: theme.colors.error }]}>
                  Your verification was rejected. Please try again with correct information.
                </Text>
              </View>
              <View style={{ height: 12 }} />
              <Button title="Retry Onboarding" onPress={handleStartOnboarding} />
            </>
          )}
        </View>
      </View>
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  greeting: {
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    marginTop: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  pollingIndicator: {
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  updatedAt: {
    marginTop: 8,
  },
  actions: {
    marginTop: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
