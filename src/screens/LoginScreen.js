import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ClinicLogo from '../components/ClinicLogo';

export default function LoginScreen({ onContinue }) {
  const [accessMethod, setAccessMethod] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const isPhone = accessMethod === 'phone';

  function continueToCalculator() {
    Keyboard.dismiss();
    // Fluxo demonstrativo: não valida, envia ou salva os dados de acesso.
    onContinue();
  }

  function showRegistrationNotice() {
    Alert.alert('Criar conta', 'O cadastro estará disponível em uma próxima etapa.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <ClinicLogo />

          <Text style={styles.title} accessibilityRole="header">Boas-vindas!</Text>
          <Text style={styles.description}>
            Acesse sua conta para acompanhar seu cuidado.
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Como deseja acessar?</Text>
            <View style={styles.methods}>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Acessar com telefone"
                accessibilityState={{ selected: isPhone }}
                onPress={() => setAccessMethod('phone')}
                style={({ pressed }) => [
                  styles.method,
                  isPhone && styles.selectedMethod,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.methodText, isPhone && styles.selectedMethodText]}>
                  Telefone
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityLabel="Acessar com e-mail"
                accessibilityState={{ selected: !isPhone }}
                onPress={() => setAccessMethod('email')}
                style={({ pressed }) => [
                  styles.method,
                  !isPhone && styles.selectedMethod,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.methodText, !isPhone && styles.selectedMethodText]}>
                  E-mail
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>{isPhone ? 'Número de telefone' : 'E-mail'}</Text>
            <TextInput
              key={accessMethod}
              style={styles.input}
              accessibilityLabel={isPhone ? 'Número de telefone' : 'E-mail'}
              placeholder={isPhone ? '(11) 99999-9999' : 'voce@exemplo.com'}
              placeholderTextColor="#6B7D76"
              keyboardType={isPhone ? 'phone-pad' : 'email-address'}
              autoComplete={isPhone ? 'tel' : 'email'}
              textContentType={isPhone ? 'telephoneNumber' : 'emailAddress'}
              autoCapitalize="none"
              autoCorrect={false}
              value={isPhone ? phone : email}
              onChangeText={isPhone ? setPhone : setEmail}
              returnKeyType="go"
              onSubmitEditing={continueToCalculator}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continuar"
              onPress={continueToCalculator}
              style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
            >
              <Text style={styles.continueText}>Continuar</Text>
            </Pressable>
          </View>

          <View style={styles.signUp}>
            <Text style={styles.signUpText}>Ainda não possui conta?</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
              onPress={showRegistrationNotice}
              style={({ pressed }) => [styles.signUpButton, pressed && styles.pressed]}
            >
              <Text style={styles.signUpLink}>Criar conta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F8F6',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 28 : 60,
    paddingBottom: 48,
  },
  content: {
    width: '100%',
    maxWidth: 440,
  },
  title: {
    color: '#173B30',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 10,
  },
  description: {
    color: '#52675F',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EAE5',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    color: '#234A3D',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  methods: {
    flexDirection: 'row',
    backgroundColor: '#EFF4F1',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 24,
  },
  method: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  selectedMethod: {
    backgroundColor: '#196652',
  },
  methodText: {
    color: '#486357',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedMethodText: {
    color: '#FFFFFF',
  },
  label: {
    color: '#234A3D',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#B8CBC2',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#173B30',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  continueButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#196652',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUp: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
  },
  signUpText: {
    color: '#52675F',
    fontSize: 14,
    textAlign: 'center',
  },
  signUpButton: {
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  signUpLink: {
    color: '#196652',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
