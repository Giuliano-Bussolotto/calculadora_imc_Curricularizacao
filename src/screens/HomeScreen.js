import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { colors, shadows } from '../theme';

const shortcuts = [
  { key: 'calculator', label: 'Calculadora\nde IMC', icon: 'calculator' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar' },
  { key: 'feed', label: 'Feed', icon: 'feed' },
  { key: 'activities', label: 'Atividades\ne Treinos', icon: 'activity' },
  { key: 'nutrition', label: 'Alimentação', icon: 'nutrition' },
  { key: 'profile', label: 'Perfil', icon: 'profile' },
];

export default function HomeScreen({ onNavigate }) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
        <View style={styles.greeting}>
          <Text style={styles.title}>Olá, Ana!</Text>
          <Text style={styles.subtitle}>Que bom ter você por aqui.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() => onNavigate('notifications')}
          style={({ pressed }) => [styles.notification, pressed && styles.pressed]}
        >
          <AppIcon name="bell" active />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.heroTitle}>Seu bem-estar{`\n`}em primeiro lugar.</Text>
        <Text style={styles.heroText}>Saúde, movimento e equilíbrio para uma vida melhor.</Text>
        <Text style={styles.heroMark}>◯</Text>
      </View>

      <View style={styles.grid}>
        {shortcuts.map(item => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            accessibilityLabel={item.label.replace('\n', ' ')}
            onPress={() => onNavigate(item.key)}
            style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
          >
            <View style={styles.iconBox}><AppIcon name={item.icon} active size={24} /></View>
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDF1DF',
  },
  avatarText: { color: '#28734A', fontSize: 19, fontWeight: '800' },
  greeting: { flex: 1, marginLeft: 12 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  notification: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF476F',
  },
  hero: {
    minHeight: 156,
    overflow: 'hidden',
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#1A4F7C',
    ...shadows.card,
  },
  heroGlow: {
    position: 'absolute',
    right: -46,
    bottom: -70,
    width: 210,
    height: 210,
    borderRadius: 110,
    backgroundColor: '#79B7E2',
    opacity: 0.36,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 27, fontWeight: '800' },
  heroText: { maxWidth: 225, marginTop: 11, color: '#EAF5FF', fontSize: 12, lineHeight: 17 },
  heroMark: { position: 'absolute', right: 38, bottom: 22, color: '#D9ECF9', fontSize: 64, opacity: 0.7 },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  shortcut: {
    width: '30.5%',
    minHeight: 116,
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    marginBottom: 9,
  },
  shortcutLabel: { color: colors.text, fontSize: 12, lineHeight: 15, textAlign: 'center', fontWeight: '700' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
