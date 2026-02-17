import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTheme } from '../../theme';

export const ReviewStep: React.FC = () => {
  const theme = useTheme();
  const draft = useOnboardingStore((state) => state.draft);

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'PASSPORT':
        return 'Passport';
      case 'DRIVERS_LICENSE':
        return "Driver's License";
      case 'NATIONAL_ID':
        return 'National ID';
      default:
        return type;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Review Your Information</Text>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.profile?.fullName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Date of Birth:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.profile?.dateOfBirth}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nationality:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.profile?.nationality}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Document</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>
            {getDocumentTypeLabel(draft?.document?.documentType || '')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Number:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.document?.documentNumber}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Address</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Address:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.address?.addressLine1}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>City:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.address?.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Country:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{draft?.address?.country}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Consents</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Terms Accepted:</Text>
          <Text style={[styles.value, { color: draft?.consents?.termsAccepted ? theme.colors.success : theme.colors.error }]}>
            {draft?.consents?.termsAccepted ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});
