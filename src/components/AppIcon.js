import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const glyphs = {
  home: '⌂',
  calculator: '▦',
  calendar: '□',
  feed: '▤',
  profile: '●',
  activity: '✦',
  nutrition: '♧',
  bell: '♢',
  plus: '+',
  arrow: '›',
};

export default function AppIcon({ name, active = false, size = 22 }) {
  return (
    <View style={styles.container} importantForAccessibility="no-hide-descendants">
      <Text style={[styles.icon, { fontSize: size }, active && styles.active]}>
        {glyphs[name] || '•'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#8994A6',
    fontWeight: '700',
    lineHeight: 26,
  },
  active: {
    color: colors.primary,
  },
});
