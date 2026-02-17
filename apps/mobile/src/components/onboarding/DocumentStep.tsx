import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from '../common/Input';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useTheme } from '../../theme';
import { DocumentType } from '../../types';

export const DocumentStep: React.FC = () => {
  const theme = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const updateDraft = useOnboardingStore((state) => state.updateDraft);

  const [documentType, setDocumentType] = useState<DocumentType>(draft?.document?.documentType || 'PASSPORT');
  const [documentNumber, setDocumentNumber] = useState(draft?.document?.documentNumber || '');

  useEffect(() => {
    updateDraft({
      document: {
        documentType,
        documentNumber,
      },
    });
  }, [documentType, documentNumber]);

  const documentTypes: DocumentType[] = ['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID'];

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'PASSPORT':
        return 'Passport';
      case 'DRIVERS_LICENSE':
        return "Driver's License";
      case 'NATIONAL_ID':
        return 'National ID';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>Document Type</Text>
      <View style={styles.radioGroup}>
        {documentTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.radioButton,
              {
                backgroundColor: documentType === type ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setDocumentType(type)}
          >
            <Text
              style={[
                styles.radioText,
                { color: documentType === type ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              {getDocumentTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        label="Document Number"
        value={documentNumber}
        onChangeText={setDocumentNumber}
        placeholder="Enter document number"
        autoCapitalize="characters"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
