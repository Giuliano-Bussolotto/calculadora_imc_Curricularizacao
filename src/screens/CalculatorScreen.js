import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { assessBmi } from '../domain/imc/assessment';
import { colors, shadows } from '../theme';

export default function CalculatorScreen() {
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState('Informe data de nascimento, sexo, altura e peso.');
  const [evaluationSummary, setEvaluationSummary] = useState(null);

  function replaceResult(message) {
    setEvaluationSummary(null);
    setResultado(message);
  }

  function calcularIMC() {
    const evaluation = assessBmi({ birthDate: dataNascimento, sex: sexo, weight: peso, height: altura });
    if (evaluation.status === 'invalid') {
      replaceResult(evaluation.message);
      return;
    }
    Keyboard.dismiss();
    if (evaluation.status === 'unsupported') {
      replaceResult(evaluation.message);
      return;
    }
    const { years, months } = evaluation.age;
    const idade = `Idade: ${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    const imc = `IMC: ${evaluation.bmi.toFixed(2).replace('.', ',')}`;
    if (evaluation.status !== 'classified') {
      setEvaluationSummary({ bmi: evaluation.bmi, classification: null, protocol: evaluation.protocol });
      setResultado(`${idade}\n${imc}\n${evaluation.message}`);
      return;
    }
    const classification = evaluation.protocol === 'who2007'
      ? `Classificação IMC por idade: ${evaluation.classification}.\nReferência: WHO 2007.`
      : `Classificação (adultos): ${evaluation.classification}.`;
    setEvaluationSummary({ bmi: evaluation.bmi, classification: evaluation.classification, protocol: evaluation.protocol });
    setResultado(`${idade}\n${imc}\n${classification}`);
  }

  function atualizarDataNascimento(value) {
    const digits = value.replace(/\//g, '');
    const formatted = /^\d{0,8}$/.test(digits)
      ? digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
      : value;
    setDataNascimento(formatted);
    replaceResult('Toque em Calcular para ver o resultado.');
  }

  function atualizarSexo(value) {
    setSexo(value);
    replaceResult('Toque em Calcular para ver o resultado.');
  }

  function atualizarPeso(value) {
    setPeso(value);
    replaceResult('Toque em Calcular para ver o resultado.');
  }

  function atualizarAltura(value) {
    setAltura(value);
    replaceResult('Toque em Calcular para ver o resultado.');
  }

  function limparCampos() {
    setDataNascimento('');
    setSexo('');
    setPeso('');
    setAltura('');
    replaceResult('Informe data de nascimento, sexo, altura e peso.');
  }

  const activeProtocol = evaluationSummary?.protocol;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.title}>Calculadora de IMC</Text>
          <Text style={styles.subtitle}>Calcule seu IMC e veja a classificação de forma rápida e segura.</Text>

          <View style={styles.protocols} accessibilityLabel="Protocolo definido automaticamente pela idade">
            <View style={[styles.protocol, activeProtocol === 'adult' && styles.activeProtocol]}>
              <Text style={[styles.protocolText, activeProtocol === 'adult' && styles.activeProtocolText]}>Adulto (20 a 59 anos)</Text>
            </View>
            <View style={[styles.protocol, activeProtocol === 'who2007' && styles.activeProtocol]}>
              <Text style={[styles.protocolText, activeProtocol === 'who2007' && styles.activeProtocolText]}>Pediátrico</Text>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldIcon}>▣</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Data de nascimento</Text>
              <TextInput
                style={styles.input}
                accessibilityLabel="Data de nascimento"
                accessibilityHint="Informe dia, mês e ano. As barras são inseridas automaticamente."
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#98A2B3"
                keyboardType="number-pad"
                autoCorrect={false}
                maxLength={10}
                value={dataNascimento}
                onChangeText={atualizarDataNascimento}
              />
            </View>
          </View>

          <View style={styles.fieldCardColumn}>
            <View style={styles.fieldHeading}>
              <Text style={styles.fieldIcon}>○</Text>
              <View>
                <Text style={styles.label}>Sexo</Text>
                <Text style={styles.hint}>Referência de crescimento para meninos ou meninas.</Text>
              </View>
            </View>
            <View style={styles.sexOptions} accessibilityRole="radiogroup">
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel="Masculino — referência meninos"
                accessibilityState={{ checked: sexo === 'male' }}
                onPress={() => atualizarSexo('male')}
                style={({ pressed }) => [styles.sexOption, sexo === 'male' && styles.selectedSex, pressed && styles.pressed]}
              >
                <Text style={[styles.sexText, sexo === 'male' && styles.selectedSexText]}>Masculino</Text>
              </Pressable>
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel="Feminino — referência meninas"
                accessibilityState={{ checked: sexo === 'female' }}
                onPress={() => atualizarSexo('female')}
                style={({ pressed }) => [styles.sexOption, sexo === 'female' && styles.selectedSex, pressed && styles.pressed]}
              >
                <Text style={[styles.sexText, sexo === 'female' && styles.selectedSexText]}>Feminino</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldIcon}>↕</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Altura (m ou cm)</Text>
              <TextInput
                style={styles.input}
                accessibilityLabel="Altura em metros"
                placeholder="Ex.: 1,75 ou 175"
                placeholderTextColor="#98A2B3"
                keyboardType="decimal-pad"
                value={altura}
                onChangeText={atualizarAltura}
              />
            </View>
          </View>

          <View style={styles.fieldCard}>
            <Text style={styles.fieldIcon}>▢</Text>
            <View style={styles.fieldContent}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                accessibilityLabel="Peso em quilogramas"
                placeholder="Ex.: 70"
                placeholderTextColor="#98A2B3"
                keyboardType="decimal-pad"
                value={peso}
                onChangeText={atualizarPeso}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Calcular"
            onPress={calcularIMC}
            style={({ pressed }) => [styles.calculateButton, pressed && styles.pressed]}
          >
            <Text style={styles.calculateButtonText}>Calcular</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Limpar campos" onPress={limparCampos} style={styles.clearButton}>
            <Text style={styles.clearText}>Limpar campos</Text>
          </Pressable>

          {evaluationSummary ? (
            <>
              <View style={styles.resultCard}>
                <Text style={styles.resultEyebrow}>Seu IMC é</Text>
                <Text style={styles.bmiValue}>{evaluationSummary.bmi.toFixed(1).replace('.', ',')}</Text>
                <View style={styles.classificationBadge}>
                  <Text style={styles.classificationText}>{evaluationSummary.classification || 'Revisão recomendada'}</Text>
                </View>
                <View style={styles.scale}>
                  <View style={[styles.scalePart, { backgroundColor: '#22B573' }]} />
                  <View style={[styles.scalePart, { backgroundColor: '#F4C84A' }]} />
                  <View style={[styles.scalePart, { backgroundColor: '#F08A3C' }]} />
                  <View style={[styles.scalePart, { backgroundColor: '#E94D5F' }]} />
                </View>
                <Text style={styles.result} accessibilityLiveRegion="polite">{resultado}</Text>
              </View>
              <View
                accessible
                accessibilityLabel="Mensagem de motivação após o resultado"
                style={styles.aiMessageCard}
              >
                <Text style={styles.aiMessageTitle}>Mensagem de motivação</Text>
                <Text style={styles.aiMessageDescription}>Após o cálculo, uma mensagem de motivação será exibida aqui junto ao seu resultado.</Text>
              </View>
            </>
          ) : (
            <View style={styles.messageCard}>
              <Text style={styles.result} accessibilityLiveRegion="polite">{resultado}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 18 : 24, paddingBottom: 32 },
  form: { width: '100%', maxWidth: 440 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { maxWidth: 330, marginTop: 5, marginBottom: 18, color: colors.muted, fontSize: 13, lineHeight: 18 },
  protocols: { flexDirection: 'row', padding: 4, marginBottom: 14, borderRadius: 16, backgroundColor: '#ECF1F7' },
  protocol: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  activeProtocol: { backgroundColor: colors.primary },
  protocolText: { color: colors.muted, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  activeProtocolText: { color: '#FFFFFF' },
  fieldCard: { minHeight: 70, flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  fieldCardColumn: { marginBottom: 10, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  fieldHeading: { flexDirection: 'row', alignItems: 'center' },
  fieldIcon: { width: 32, color: colors.primary, fontSize: 22, textAlign: 'center', fontWeight: '800' },
  fieldContent: { flex: 1, marginLeft: 10 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  input: { minHeight: 38, paddingVertical: 4, color: colors.text, fontSize: 16, fontWeight: '700' },
  hint: { marginTop: 2, color: colors.muted, fontSize: 10 },
  sexOptions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  sexOption: { flex: 1, minWidth: 110, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAFC' },
  selectedSex: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sexText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  selectedSexText: { color: colors.primaryDark },
  calculateButton: { overflow: 'hidden', minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 14, marginTop: 4, borderRadius: 14, backgroundColor: colors.primary },
  calculateButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  clearButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  clearText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  messageCard: { marginTop: 4, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  resultCard: { marginTop: 8, padding: 20, alignItems: 'center', borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  aiMessageCard: { width: '100%', minHeight: 128, padding: 20, justifyContent: 'center', marginTop: 14, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  aiMessageTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  aiMessageDescription: { marginTop: 8, color: colors.muted, fontSize: 13, lineHeight: 20 },
  resultEyebrow: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  bmiValue: { marginTop: 2, color: colors.text, fontSize: 48, lineHeight: 54, fontWeight: '900' },
  classificationBadge: { marginTop: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, backgroundColor: '#E2F6E8' },
  classificationText: { color: '#267A48', fontSize: 12, fontWeight: '800' },
  scale: { width: '100%', height: 7, flexDirection: 'row', overflow: 'hidden', marginTop: 18, borderRadius: 5 },
  scalePart: { flex: 1 },
  result: { width: '100%', marginTop: 14, color: colors.text, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  pressed: { opacity: 0.72 },
});
