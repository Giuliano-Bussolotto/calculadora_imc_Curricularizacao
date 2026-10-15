import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppIcon from './AppIcon';
import { colors } from '../theme';

export const mainTabs = [
  { key: 'home', label: 'Início', icon: 'home' },
  { key: 'calculator', label: 'Calculadora', icon: 'calculator' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar' },
  { key: 'feed', label: 'Feed', icon: 'feed' },
  { key: 'profile', label: 'Perfil', icon: 'profile' },
];

export default function BottomNavigation({ activeScreen, onNavigate }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {mainTabs.map(tab => {
        const active = activeScreen === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            onPress={() => onNavigate(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <AppIcon name={tab.icon} active={active} />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    paddingBottom: 8,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
    opacity: 0.85,
  },
  label: {
    marginTop: 2,
    color: '#8994A6',
    fontSize: 10,
    fontWeight: '600',
  },
  activeLabel: {
    color: colors.primary,
  },
});
