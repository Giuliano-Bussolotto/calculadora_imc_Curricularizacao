import { useState } from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function CalculatorScreen() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [resultado, setResultado] = useState('Informe seu peso e sua altura.');

  function calcularIMC() {
    const pesoTexto = peso.trim().replace(',', '.');
    const alturaTexto = altura.trim().replace(',', '.');
    const numeroDecimal = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
    const pesoNumero = Number(pesoTexto);
    const alturaNumero = Number(alturaTexto);

    if (
      !numeroDecimal.test(pesoTexto) ||
      !numeroDecimal.test(alturaTexto) ||
      !Number.isFinite(pesoNumero) ||
      !Number.isFinite(alturaNumero) ||
      pesoNumero <= 0 ||
      alturaNumero <= 0
    ) {
      setResultado('Informe peso e altura válidos, maiores que zero.');
      return;
    }

    // Alturas a partir de 10 são interpretadas em centímetros (175 → 1.75 m).
    const alturaMetros = alturaNumero >= 10 ? alturaNumero / 100 : alturaNumero;
    const imc = pesoNumero / (alturaMetros * alturaMetros);

    if (!Number.isFinite(imc) || imc < 0.005 || imc >= 1e21) {
      setResultado('Confira os valores de peso e altura informados.');
      return;
    }

    // Faixas de classificação do IMC para adultos, antes do arredondamento.
    let classificacao;
    if (imc < 18.5) {
      classificacao = 'Abaixo do peso';
    } else if (imc < 25) {
      classificacao = 'Peso adequado';
    } else if (imc < 30) {
      classificacao = 'Sobrepeso';
    } else if (imc < 35) {
      classificacao = 'Obesidade grau I';
    } else if (imc < 40) {
      classificacao = 'Obesidade grau II';
    } else {
      classificacao = 'Obesidade grau III';
    }

    Keyboard.dismiss();
    setResultado(`IMC: ${imc.toFixed(2).replace('.', ',')}\nClassificação (adultos): ${classificacao}.`);
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
    padding: 24,
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
  result: {
    color: '#333',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 26,
  },
});
