import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { visibleOwnedResources } from '../domain/access/privacy';
import { canCompleteAppointment, createProfileData } from '../domain/profile/profileData';
import { colors, shadows } from '../theme';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
function calendarDays(year, month) {
  const firstWeekDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];
}

export default function AgendaScreen({ currentUser = { id: 'patient-ana', role: 'patient' }, appointments = createProfileData().appointments, onCompleteAppointment }) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = calendarDays(year, month);
  const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const visibleAppointments = visibleOwnedResources(currentUser, appointments).filter(item => item.date === selectedDate);

  function confirmAttendance(item) {
    if (!canCompleteAppointment(item, currentUser.id)) return;
    Alert.alert('Confirmar consulta realizada', `Você compareceu e realizou o atendimento de ${item.specialty} com ${item.professional}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sim, realizei a consulta', onPress: () => onCompleteAppointment?.(item.id) },
    ]);
  }

  function changeMonth(offset) {
    const next = new Date(year, month + offset, 1);
    setVisibleMonth(next);
    setSelectedDay(1);
  }

  function addAppointment() {
    Alert.alert('Novo agendamento', 'O cadastro de novos horários será conectado à clínica em uma próxima etapa.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleIcon}><AppIcon name="calendar" active size={24} /></View>
          <Text style={styles.title}>Agenda</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar agendamento"
          onPress={addAppointment}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <AppIcon name="plus" active size={25} />
        </Pressable>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.monthHeader}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => changeMonth(-1)} style={styles.arrowButton}>
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => changeMonth(1)} style={styles.arrowButton}>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekDays.map(day => <Text key={day} style={styles.weekDay}>{day}</Text>)}
        </View>
        <View style={styles.daysGrid}>
          {days.map((day, index) => {
            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const selected = day === selectedDay;
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={`${day} de ${monthNames[month]} de ${year}`}
                accessibilityState={{ selected }}
                onPress={() => setSelectedDay(day)}
                style={styles.dayCell}
              >
                <View style={[styles.dayCircle, selected && styles.selectedDay, isToday && !selected && styles.today]}>
                  <Text style={[styles.dayText, selected && styles.selectedDayText]}>{day}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.selectedTitle}>{selectedDay} de {monthNames[month]}</Text>
      <View style={styles.appointments}>
        {visibleAppointments.map(item => (
          <View
            key={item.id}
            style={styles.appointment}
          >
            <View style={styles.appointmentIcon}><AppIcon name={item.icon} active size={20} /></View>
            <View style={styles.appointmentText}>
              <Text style={styles.appointmentType}>{item.specialty}</Text>
              <Text style={styles.professional}>{item.professional}</Text>
              <Text style={styles.time}>{item.time}</Text>
              {item.completedAt ? (
                <Text style={styles.completed}>✓ Consulta realizada · confirmada por você</Text>
              ) : onCompleteAppointment && (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar realização da consulta de ${item.specialty}`}
                    disabled={!canCompleteAppointment(item, currentUser.id)}
                    onPress={() => confirmAttendance(item)}
                    style={[styles.completeButton, !canCompleteAppointment(item, currentUser.id) && styles.disabled]}
                  >
                    <Text style={styles.completeText}>Compareci e realizei a consulta</Text>
                  </Pressable>
                  {!canCompleteAppointment(item, currentUser.id) && <Text style={styles.pendingText}>Confirme após o horário do atendimento.</Text>}
                </>
              )}
            </View>
          </View>
        ))}
        {visibleAppointments.length === 0 && (
          <View style={styles.emptyState} accessibilityLiveRegion="polite">
            <Text style={styles.emptyTitle}>Nenhum compromisso na sua agenda</Text>
            <Text style={styles.emptyText}>Por privacidade, somente seus próprios horários são exibidos.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.primarySoft },
  title: { marginLeft: 10, color: colors.text, fontSize: 27, fontWeight: '900' },
  addButton: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  calendarCard: { padding: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  arrowButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  arrow: { color: colors.text, fontSize: 31, lineHeight: 34 },
  monthTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginBottom: 5 },
  weekDay: { width: '14.285%', color: colors.muted, fontSize: 11, textAlign: 'center', fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.285%', height: 42, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  selectedDay: { backgroundColor: colors.primary },
  today: { borderWidth: 1, borderColor: colors.primary },
  dayText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  selectedDayText: { color: '#FFFFFF', fontWeight: '800' },
  selectedTitle: { marginTop: 24, marginBottom: 12, color: colors.text, fontSize: 19, fontWeight: '800' },
  appointments: { gap: 10 },
  emptyState: { padding: 20, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  emptyText: { marginTop: 5, color: colors.muted, fontSize: 12, lineHeight: 18 },
  appointment: { minHeight: 82, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  appointmentIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  appointmentText: { flex: 1, marginLeft: 12 },
  appointmentType: { color: colors.text, fontSize: 14, fontWeight: '800' },
  professional: { marginTop: 2, color: colors.muted, fontSize: 12 },
  time: { marginTop: 2, color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  completeButton: { minHeight: 48, marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: colors.primarySoft, justifyContent: 'center' },
  completeText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  completed: { marginTop: 10, color: '#26784A', fontSize: 13, lineHeight: 19 },
  pendingText: { marginTop: 6, color: colors.muted, fontSize: 12, lineHeight: 18 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.7 },
});
