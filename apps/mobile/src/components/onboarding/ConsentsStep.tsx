import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTheme } from '../../theme';

export const ConsentsStep: React.FC = () => {
  const theme = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);

  const [termsAccepted, setTermsAccepted] = useState(draft?.consents?.termsAccepted || false);

  useEffect(() => {
    updateDraft({
      consents: {
        termsAccepted,
      },
    });
  }, [termsAccepted]);

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Terms and Conditions</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          By checking this box, you agree to our terms and conditions and privacy policy. We will use your
          information for identity verification purposes only.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.checkboxContainer, { borderColor: theme.colors.border }]}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <View style={[styles.checkbox, { borderColor: theme.colors.border }]}>
          {termsAccepted && (
            <View style={[styles.checkboxInner, { backgroundColor: theme.colors.primary }]} />
          )}
        </View>
        <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
          I accept the terms and conditions
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
});
