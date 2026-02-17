import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common/Input';
import { useOnboardingStore } from '../../stores/onboardingStore';

export const AddressStep: React.FC = () => {
  const draft = useOnboardingStore((state) => state.draft);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);

  const [addressLine1, setAddressLine1] = useState(draft?.address?.addressLine1 || '');
  const [city, setCity] = useState(draft?.address?.city || '');
  const [country, setCountry] = useState(draft?.address?.country || '');

  useEffect(() => {
    updateDraft({
      address: {
        addressLine1,
        city,
        country,
      },
    });
  }, [addressLine1, city, country]);

  return (
    <View style={styles.container}>
      <Input
        label="Address Line 1"
        value={addressLine1}
        onChangeText={setAddressLine1}
        placeholder="Enter your address"
        autoCapitalize="words"
      />
      <Input
        label="City"
        value={city}
        onChangeText={setCity}
        placeholder="Enter your city"
        autoCapitalize="words"
      />
      <Input
        label="Country"
        value={country}
        onChangeText={setCountry}
        placeholder="Enter your country"
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
