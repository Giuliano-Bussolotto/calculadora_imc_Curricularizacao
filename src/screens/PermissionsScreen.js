import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppIcon from '../components/AppIcon';
import { moduleLabels, permissionsFor } from '../domain/access/permissions';
import { getRole } from '../domain/access/roles';
import { colors, shadows } from '../theme';

export default function PermissionsScreen({ roleId, onBack }) {
  const role = getRole(roleId);
  const permissions = permissionsFor(roleId);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar para cargos" onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>CARGO</Text>
          <Text style={styles.title}>{role?.name || 'Função'}</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryIcon}><AppIcon name="profile" active size={22} /></View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Acesso restrito por privacidade</Text>
          <Text style={styles.summaryText}>{role?.description}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Módulos disponíveis</Text>
      <View style={styles.list}>
        {permissions.modules.map(moduleId => (
          <View key={moduleId} style={styles.permission} accessibilityLabel={`Permitido: ${moduleLabels[moduleId]}`}>
            <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
            <Text style={styles.permissionText}>{moduleLabels[moduleId]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Dados protegidos</Text>
        <Text style={styles.noticeText}>Agendas, acessos, curtidas, históricos e dados pessoais de outros usuários não ficam disponíveis para este perfil.</Text>
      </View>
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
  summary: { flexDirection: 'row', padding: 18, borderRadius: 20, backgroundColor: '#1A4F7C', ...shadows.card },
  summaryIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#FFFFFF' },
  summaryCopy: { flex: 1, marginLeft: 13 },
  summaryTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  summaryText: { marginTop: 5, color: '#EAF5FF', fontSize: 12, lineHeight: 17 },
  sectionTitle: { marginTop: 24, marginBottom: 11, color: colors.text, fontSize: 18, fontWeight: '800' },
  list: { gap: 9 },
  permission: { minHeight: 62, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 17, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  check: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E8F7EE' },
  checkText: { color: '#26784A', fontSize: 16, fontWeight: '900' },
  permissionText: { marginLeft: 11, color: colors.text, fontSize: 14, fontWeight: '700' },
  notice: { marginTop: 18, padding: 17, borderRadius: 18, backgroundColor: colors.primarySoft },
  noticeTitle: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  noticeText: { marginTop: 6, color: colors.muted, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.72 },
});
