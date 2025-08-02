import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { GridIcon } from '../../constants/Icons';

interface HeaderOverviewButtonProps {
  onPress: () => void;
}

export default function HeaderOverviewButton({ onPress }: HeaderOverviewButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.tint }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <GridIcon size={16} color="#ffffff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
