import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useTheme } from '../theme';
import { Button } from '../components/common/Button';
import { GradientBackground } from '../components/common/GradientBackground';

const SettingsScreen = () => {
  const theme = useTheme();
  const themeMode = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <View style={styles.content}>
        {/* User info */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {user?.fullName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <Text style={[styles.value, { color: theme.colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Theme toggle */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Dark Mode</Text>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Logout button */}
        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={handleLogout} variant="secondary" />
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
  },
  logoutContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});

export default SettingsScreen;
