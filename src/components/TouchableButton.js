import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

/**
 * Consistent TouchableButton component with proper mobile touch targets
 * and feedback for better UX across the app
 */
export default function TouchableButton({ 
  style, 
  textStyle, 
  onPress, 
  children, 
  accessibilityLabel,
  accessibilityRole = "button",
  activeOpacity = 0.7,
  disabled = false,
  ...props 
}) {
  return (
    <TouchableOpacity
      style={[styles.defaultButton, style, disabled && styles.disabled]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      activeOpacity={activeOpacity}
      disabled={disabled}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.defaultText, textStyle, disabled && styles.disabledText]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  defaultButton: {
    minHeight: 44, // Minimum touch target for mobile
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});