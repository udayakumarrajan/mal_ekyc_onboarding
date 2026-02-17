import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { useOnboardingStore } from '../../stores/onboardingStore';

export const ProfileStep: React.FC = () => {
  const draft = useOnboardingStore((state) => state.draft);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);

  const [fullName, setFullName] = useState(draft?.profile?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(draft?.profile?.dateOfBirth || '');
  const [nationality, setNationality] = useState(draft?.profile?.nationality || '');

  useEffect(() => {
    updateDraft({
      profile: {
        fullName,
        dateOfBirth,
        nationality,
      },
    });
  }, [fullName, dateOfBirth, nationality]);

  return (
    <View style={styles.container}>
      <Input
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        autoCapitalize="words"
      />
      <Input
        label="Date of Birth"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        placeholder="YYYY-MM-DD"
      />
      <Input
        label="Nationality"
        value={nationality}
        onChangeText={setNationality}
        placeholder="Enter your nationality"
        autoCapitalize="words"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
