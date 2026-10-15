import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { colors, shadows } from '../theme';

const wellbeingReminders = [
  { id: 'hydration', title: 'Hidratação', description: 'Lembretes para beber água ao longo do dia.' },
  { id: 'walking', title: 'Caminhadas', description: 'Incentivos nos horários escolhidos para caminhar.' },
  { id: 'exercise', title: 'Exercícios', description: 'Lembretes para praticar as atividades planejadas.' },
];

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState({ hydration: true, walking: false, exercise: true });

  function toggle(id) {
    setEnabled(current => ({ ...current, [id]: !current[id] }));
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleIcon}><AppIcon name="bell" active size={24} /></View>
        <View style={styles.heading}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>Seus lembretes pessoais</Text>
        </View>
      </View>

      <View style={styles.appointmentCard} accessibilityLabel="Lembrete automático de consulta ativo">
        <View style={styles.appointmentIcon}><AppIcon name="calendar" active size={23} /></View>
        <View style={styles.appointmentCopy}>
          <Text style={styles.appointmentTitle}>Consultas agendadas</Text>
          <Text style={styles.appointmentText}>Ao marcar uma consulta, você receberá um lembrete no seu celular no dia do atendimento.</Text>
        </View>
        <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Automático</Text></View>
      </View>

      <Text style={styles.sectionTitle}>Bem-estar</Text>
      <View style={styles.list}>
        {wellbeingReminders.map(reminder => {
          const active = enabled[reminder.id];
          return (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderCopy}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderDescription}>{reminder.description}</Text>
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityLabel={`Lembrete de ${reminder.title}`}
                accessibilityState={{ checked: active }}
                onPress={() => toggle(reminder.id)}
                style={[styles.switchTrack, active && styles.switchTrackActive]}
              >
                <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
              </Pressable>
            </View>
          );
        })}
      </View>

      <Text style={styles.privacy}>Estes lembretes pertencem somente a você e não são compartilhados com outros pacientes ou profissionais.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  titleIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.primarySoft },
  heading: { marginLeft: 12 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { marginTop: 2, color: colors.muted, fontSize: 12 },
  appointmentCard: { padding: 18, borderRadius: 21, backgroundColor: '#1A4F7C', ...shadows.card },
  appointmentIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF' },
  appointmentCopy: { marginTop: 13 },
  appointmentTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  appointmentText: { marginTop: 6, paddingRight: 8, color: '#EAF5FF', fontSize: 12, lineHeight: 18 },
  activeBadge: { alignSelf: 'flex-start', marginTop: 13, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: '#DDF1DF' },
  activeBadgeText: { color: '#26784A', fontSize: 10, fontWeight: '900' },
  sectionTitle: { marginTop: 24, marginBottom: 11, color: colors.text, fontSize: 18, fontWeight: '800' },
  list: { gap: 10 },
  reminderCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  reminderCopy: { flex: 1, paddingRight: 12 },
  reminderTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  reminderDescription: { marginTop: 4, color: colors.muted, fontSize: 11, lineHeight: 16 },
  switchTrack: { width: 50, height: 30, padding: 3, justifyContent: 'center', borderRadius: 16, backgroundColor: '#D5DCE6' },
  switchTrackActive: { backgroundColor: colors.primary },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', ...shadows.card },
  switchThumbActive: { alignSelf: 'flex-end' },
  privacy: { marginTop: 18, padding: 15, color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center' },
});
