import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderBackButtonProps {
  onPress: () => void;
}

export default function HeaderBackButton({ onPress }: HeaderBackButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.container, { backgroundColor: colors.tint + '10', borderColor: colors.tint + '20' }]}
    >
      <Text style={[styles.text, { color: colors.tint }]}>←</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
