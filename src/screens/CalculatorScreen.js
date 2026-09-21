import { useState } from 'react';
import {
  Button,
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

export default function CalculatorScreen() {
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState('Informe data de nascimento, sexo, altura e peso.');

  function calcularIMC() {
    const evaluation = assessBmi({ birthDate: dataNascimento, sex: sexo, weight: peso, height: altura });
    if (evaluation.status === 'invalid') {
      setResultado(evaluation.message);
      return;
    }
    Keyboard.dismiss();
    if (evaluation.status === 'unsupported') {
      setResultado(evaluation.message);
      return;
    }
    const { years, months } = evaluation.age;
    const idade = `Idade: ${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
    const imc = `IMC: ${evaluation.bmi.toFixed(2).replace('.', ',')}`;
    if (evaluation.status !== 'classified') {
      setResultado(`${idade}\n${imc}\n${evaluation.message}`);
      return;
    }
    const classification = evaluation.protocol === 'who2007'
      ? `Classificação IMC por idade: ${evaluation.classification}.\nReferência: WHO 2007.`
      : `Classificação (adultos): ${evaluation.classification}.`;
    setResultado(`${idade}\n${imc}\n${classification}`);
  }

  function atualizarDataNascimento(value) {
    const digits = value.replace(/\//g, '');
    // Máscara visual; a data civil completa é validada no domínio, sem idade fixa.
    const formatted = /^\d{0,8}$/.test(digits)
      ? digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
      : value;
    setDataNascimento(formatted);
    setResultado('Toque em Calcular para ver o resultado.');
  }

  function atualizarSexo(value) {
    setSexo(value);
    setResultado('Toque em Calcular para ver o resultado.');
  }

  function atualizarPeso(valor) {
    setPeso(valor);
    setResultado('Toque em Calcular para ver o resultado.');
  }

  function atualizarAltura(valor) {
    setAltura(valor);
    setResultado('Toque em Calcular para ver o resultado.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.title}>Calculadora IMC</Text>

          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            accessibilityLabel="Data de nascimento"
            accessibilityHint="Informe dia, mês e ano. As barras são inseridas automaticamente."
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#777"
            keyboardType="number-pad"
            autoCorrect={false}
            maxLength={10}
            value={dataNascimento}
            onChangeText={atualizarDataNascimento}
          />

          <Text style={styles.label}>Sexo</Text>
          <Text style={styles.hint}>Referência de crescimento: meninos ou meninas.</Text>
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

          <Text style={styles.label}>Altura (m)</Text>
          <TextInput
            style={styles.input}
            accessibilityLabel="Altura em metros"
            placeholder="Ex.: 1,75"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={altura}
            onChangeText={atualizarAltura}
          />

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            accessibilityLabel="Peso em quilogramas"
            placeholder="Ex.: 70"
            placeholderTextColor="#777"
            keyboardType="decimal-pad"
            value={peso}
            onChangeText={atualizarPeso}
          />

          <Button title="Calcular" onPress={calcularIMC} color="#2458a6" />

          <Text style={styles.result} accessibilityLiveRegion="polite">
            {resultado}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 24 : 60,
    paddingBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 420,
  },
  title: {
    color: '#111',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    color: '#111',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    color: '#111',
    fontSize: 18,
    padding: 12,
    marginBottom: 20,
  },
  hint: {
    color: '#555',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  sexOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  sexOption: {
    flex: 1,
    minWidth: 110,
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSex: { backgroundColor: '#2458a6', borderColor: '#2458a6' },
  sexText: { color: '#333', fontSize: 16 },
  selectedSexText: { color: '#fff' },
  pressed: { opacity: 0.75 },
  result: {
    color: '#333',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 26,
  },
});
