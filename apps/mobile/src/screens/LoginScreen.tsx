import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../theme';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GradientBackground } from '../components/common/GradientBackground';

const LoginScreen = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const login = useAuthStore((state) => state.login);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    let hasError = false;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login Failed', error || 'Invalid email or password');
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.typography.fontSize.title }]}>
            Welcome to eKYC
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.regular }]}>
            Sign in to continue
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              placeholder="Enter your password"
              secureTextEntry
              error={passwordError}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={status === 'logging_in'}
              disabled={status === 'logging_in'}
            />
          </View>

          <View style={styles.helpText}>
            <Text style={[styles.hint, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small }]}>
              Test credentials:
            </Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small }]}>
              Email: udayakumar.rajan@example.com
            </Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.small }]}>
              Password: password123
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    marginTop: 16,
  },
  helpText: {
    marginTop: 24,
    alignItems: 'center',
  },
  hint: {
    marginTop: 4,
  },
});

export default LoginScreen;
