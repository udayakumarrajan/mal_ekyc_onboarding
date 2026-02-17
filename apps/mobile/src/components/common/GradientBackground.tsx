import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children, style }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {/* Cool Blue Glow Effect - Top Right */}
      <LinearGradient
        colors={[
          'rgba(70, 130, 180, 0.3)',
          'rgba(70, 130, 180, 0.15)',
          'transparent',
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradient, styles.topRightGlow]}
      />
      
      {/* Optional: Bottom Left Glow for balance */}
      <LinearGradient
        colors={[
          'rgba(100, 149, 237, 0.2)',
          'rgba(100, 149, 237, 0.1)',
          'transparent',
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, styles.bottomLeftGlow]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  topRightGlow: {
    top: 0,
    right: 0,
  },
  bottomLeftGlow: {
    bottom: 0,
    left: 0,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
