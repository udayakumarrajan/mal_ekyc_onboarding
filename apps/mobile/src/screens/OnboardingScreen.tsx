import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useTheme } from '../theme';
import { Button } from '../components/common/Button';
import { ProfileStep } from '../components/onboarding/ProfileStep';
import { DocumentStep } from '../components/onboarding/DocumentStep';
import { AddressStep } from '../components/onboarding/AddressStep';
import { ConsentsStep } from '../components/onboarding/ConsentsStep';
import { ReviewStep } from '../components/onboarding/ReviewStep';
import { GradientBackground } from '../components/common/GradientBackground';

const OnboardingScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  
  const {
    draft,
    currentStep,
    submissionState,
    error,
    nextStep,
    previousStep,
    submitOnboarding,
    loadDraft,
  } = useOnboardingStore();

  useEffect(() => {
    loadDraft();
  }, []);

  const steps = [
    { title: 'Profile', component: ProfileStep },
    { title: 'Document', component: DocumentStep },
    { title: 'Address', component: AddressStep },
    { title: 'Consents', component: ConsentsStep },
    { title: 'Review', component: ReviewStep },
  ];

  const CurrentStepComponent = steps[currentStep]?.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      previousStep();
    }
  };

  const handleSubmit = async () => {
    try {
      await submitOnboarding();
      Alert.alert(
        'Success',
        'Your onboarding has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home' as never),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Submission Failed', error || 'Failed to submit onboarding');
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index <= currentStep ? theme.colors.primary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
        </Text>
      </View>

      {/* Step content */}
      <View style={styles.content}>
        {CurrentStepComponent && <CurrentStepComponent />}
      </View>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        {!isFirstStep && (
          <View style={styles.buttonHalf}>
            <Button
              title="Back"
              onPress={handleBack}
              variant="secondary"
              disabled={submissionState === 'submitting'}
            />
          </View>
        )}
        <View style={isFirstStep ? styles.buttonFull : styles.buttonHalf}>
          {isLastStep ? (
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={submissionState === 'submitting'}
              disabled={submissionState === 'submitting' || !draft?.consents?.termsAccepted}
            />
          ) : (
            <Button title="Next" onPress={handleNext} />
          )}
        </View>
        </View>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    paddingTop: 10,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressDot: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  buttonFull: {
    flex: 1,
  },
  buttonHalf: {
    flex: 1,
  },
});

export default OnboardingScreen;
