import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { profileCollections, validatePasswordForm } from '../domain/profile/profileData';
import { colors, shadows } from '../theme';

const sections = [
  { id: 'password', title: 'Alterar senha', icon: 'profile' },
  { id: 'posts', title: 'Minhas postagens', icon: 'feed' },
  { id: 'saved', title: 'Itens salvos', icon: 'bookmark' },
  { id: 'liked', title: 'Itens curtidos', icon: 'heart' },
  { id: 'bmi', title: 'Histórico de cálculos de IMC', icon: 'calculator' },
  { id: 'appointments', title: 'Consultas concluídas', icon: 'calendar' },
  { id: 'terms', title: 'Termos e políticas', icon: 'feed' },
];
const emptyMessages = {
  posts: 'Você ainda não fez publicações.',
  saved: 'Você ainda não salvou publicações. Salve itens no Feed para encontrá-los aqui.',
  liked: 'Você ainda não curtiu publicações. Curta itens no Feed para encontrá-los aqui.',
  bmi: 'Você ainda não realizou cálculos de IMC. Os próximos resultados aparecerão aqui.',
  appointments: 'Nenhuma consulta concluída. Após o atendimento, confirme na Agenda que você compareceu e realizou a consulta.',
};

function formatDate(date) {
  return date.split('T')[0].split('-').reverse().join('/');
}

export default function ProfileScreen({ currentUser, data, section = null, onSectionChange }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const collections = profileCollections(data, currentUser.id);
  const selected = sections.find(item => item.id === section);
  const entries = collections[section] || [];

  useEffect(() => {
    if (section !== 'password') {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setPasswordMessage('');
    }
  }, [section]);

  function back() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setPasswordMessage('');
    onSectionChange(null);
  }

  function validatePassword() {
    const error = validatePasswordForm({ currentPassword, newPassword, confirmation });
    setPasswordMessage(error || 'Dados validados. A senha não foi alterada: a troca estará disponível quando o acesso por senha for integrado.');
    if (!error) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {selected && (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar para Perfil" onPress={back} style={styles.backButton}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
          )}
          <Text accessibilityRole="header" style={styles.title}>{selected?.title || 'Perfil'}</Text>
        </View>

        {!selected && (
          <>
            <View style={styles.userCard}>
              <Image
                source={currentUser.photoUri && !photoFailed ? { uri: currentUser.photoUri } : require('../../assets/profile-avatar.png')}
                accessibilityLabel={currentUser.photoUri && !photoFailed ? `Foto de perfil de ${currentUser.name}` : 'Foto de perfil padrão'}
                onError={() => setPhotoFailed(true)}
                style={styles.photo}
              />
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.demoLabel}>Perfil demonstrativo</Text>
            </View>
            <View style={styles.menu}>
              {sections.map(item => (
                <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => onSectionChange(item.id)} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}>
                  <View style={styles.icon}><AppIcon name={item.icon} active /></View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <AppIcon name="arrow" />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {section === 'password' && (
          <View style={styles.card}>
            <Text style={styles.description}>A alteração de senha estará disponível após a integração do acesso por senha. Você já pode conferir os dados do formulário.</Text>
            {[
              { label: 'Senha atual', value: currentPassword, change: setCurrentPassword, current: true },
              { label: 'Nova senha', value: newPassword, change: setNewPassword },
              { label: 'Confirmar nova senha', value: confirmation, change: setConfirmation },
            ].map(field => (
              <View key={field.label}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput accessibilityLabel={field.label} value={field.value} onChangeText={value => { field.change(value); setPasswordMessage(''); }} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={field.current ? 'current-password' : 'new-password'} textContentType={field.current ? 'password' : 'newPassword'} style={styles.input} />
              </View>
            ))}
            <Text style={styles.description}>Use pelo menos 8 caracteres na nova senha.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Validar dados de senha" onPress={validatePassword} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Validar dados</Text>
            </Pressable>
            {!!passwordMessage && <Text accessibilityLiveRegion="polite" style={styles.message}>{passwordMessage}</Text>}
          </View>
        )}

        {!!emptyMessages[section] && entries.length === 0 && (
          <View style={styles.card}><Text style={styles.description}>{emptyMessages[section]}</Text></View>
        )}
        {['posts', 'saved', 'liked'].includes(section) && entries.map(post => (
          <View key={post.id} style={styles.card}>
            <Text style={styles.cardTitle}>{post.authorName}</Text>
            <Text style={styles.body}>{post.text}</Text>
          </View>
        ))}
        {section === 'bmi' && entries.map(entry => (
          <View key={entry.id} style={styles.card}>
            <Text style={styles.date}>{formatDate(entry.recordedAt)} · {new Date(entry.recordedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.bmi}>IMC {entry.bmi.toFixed(2).replace('.', ',')}</Text>
            <Text style={styles.cardTitle}>{entry.classification || 'Revisão recomendada'}</Text>
            <Text style={styles.body}>{entry.weightKg} kg · {entry.heightMeters} m</Text>
            <Text style={styles.description}>{entry.protocol === 'who2007' ? 'Pediátrico · OMS 2007' : 'Adulto'}</Text>
            {!!entry.message && <Text style={styles.body}>{entry.message}</Text>}
          </View>
        ))}
        {section === 'appointments' && entries.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.date}>{formatDate(item.date)} · {item.time}</Text>
            <Text style={styles.cardTitle}>{item.specialty}</Text>
            <Text style={styles.body}>{item.professional}</Text>
            <Text style={styles.completed}>✓ Comparecimento e realização confirmados por você</Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  title: { flex: 1, color: colors.text, fontSize: 26, fontWeight: '800' },
  backButton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primarySoft },
  backText: { color: colors.primary, fontSize: 32 },
  userCard: { padding: 24, marginBottom: 22, alignItems: 'center', borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  photo: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primarySoft },
  userName: { marginTop: 14, color: colors.text, fontSize: 24, fontWeight: '800' },
  demoLabel: { marginTop: 5, color: colors.muted, fontSize: 12 },
  menu: { gap: 10 },
  menuItem: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.primarySoft },
  menuText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
  card: { padding: 18, marginBottom: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  body: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 8 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  date: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  bmi: { color: colors.primaryDark, fontSize: 26, fontWeight: '800', marginBottom: 8 },
  completed: { color: '#26784A', fontSize: 13, lineHeight: 20, marginTop: 12 },
  label: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  input: { minHeight: 52, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 16, marginBottom: 8 },
  primaryButton: { minHeight: 50, padding: 14, marginTop: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.primary },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  message: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 16 },
  pressed: { opacity: 0.7 },
});
