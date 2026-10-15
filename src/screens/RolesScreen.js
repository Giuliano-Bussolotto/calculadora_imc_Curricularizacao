import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { roles } from '../domain/access/roles';
import { canCreateSupervisor } from '../domain/access/supervisorCreation';
import { colors, shadows } from '../theme';

export default function RolesScreen({ onBack, onSelectRole, currentUser = { id: 'admin-giuliano', role: 'admin' } }) {
  function createRole() {
    Alert.alert(
      'Criar nova função',
      'O formulário será conectado ao backend na próxima etapa. A função deverá definir módulos e permissões antes de ser ativada.',
    );
  }

  function createSupervisor() {
    Alert.alert(
      'Novo Supervisor/Diretor',
      'Permissão confirmada. O convite será enviado quando a integração com o backend estiver disponível.',
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ADMINISTRAÇÃO</Text>
          <Text style={styles.title}>Cargos e permissões</Text>
        </View>
      </View>

      <Text style={styles.intro}>Funções atuais da clínica. Novos cargos poderão ser configurados sem alterar a estrutura do aplicativo.</Text>

      <View style={styles.list}>
        {roles.map(role => (
          <Pressable
            key={role.id}
            accessibilityRole="button"
            accessibilityLabel={`Ver permissões de ${role.name}`}
            onPress={() => onSelectRole(role.id)}
            style={({ pressed }) => [styles.roleCard, pressed && styles.pressed]}
          >
            <View style={styles.roleIcon}><AppIcon name="profile" active size={18} /></View>
            <View style={styles.roleCopy}>
              <Text style={styles.roleName}>{role.name}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
            <View style={styles.status}><Text style={styles.statusText}>Ativo</Text></View>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Criar nova função"
        onPress={createRole}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <AppIcon name="plus" active size={22} />
        <Text style={styles.primaryButtonText}>Criar nova função</Text>
      </Pressable>

      {canCreateSupervisor(currentUser) && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar novo Supervisor ou Diretor"
          onPress={createSupervisor}
          style={({ pressed }) => [styles.adminButton, pressed && styles.pressed]}
        >
          <Text style={styles.adminButtonText}>Criar Supervisor/Diretor</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.primarySoft },
  backIcon: { color: colors.primary, fontSize: 32, lineHeight: 34 },
  heading: { flex: 1, marginLeft: 12 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { marginTop: 3, color: colors.text, fontSize: 25, fontWeight: '900' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  list: { gap: 10 },
  roleCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  roleIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.primarySoft },
  roleCopy: { flex: 1, marginHorizontal: 11 },
  roleName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  roleDescription: { marginTop: 4, color: colors.muted, fontSize: 11, lineHeight: 15 },
  status: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: '#E8F7EE' },
  statusText: { color: '#26784A', fontSize: 10, fontWeight: '800' },
  primaryButton: { minHeight: 52, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#CFE6FF' },
  primaryButtonText: { marginLeft: 7, color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  adminButton: { minHeight: 52, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primary },
  adminButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
