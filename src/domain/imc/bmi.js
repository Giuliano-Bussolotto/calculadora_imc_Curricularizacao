function parsePositiveDecimal(input) {
  if (typeof input !== 'string') return null;
  const text = input.trim().replace(',', '.');
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function calculateBmi(weight, height) {
  const weightKg = parsePositiveDecimal(weight);
  const heightValue = parsePositiveDecimal(height);
  if (weightKg === null || heightValue === null) {
    throw new RangeError('Informe peso e altura válidos, maiores que zero.');
  }
  // Preserva a regra original de entrada: 175 cm e 1,75 m são equivalentes.
  const heightMeters = heightValue >= 10 ? heightValue / 100 : heightValue;
  const bmi = weightKg / (heightMeters * heightMeters);
  if (!Number.isFinite(bmi) || bmi < 0.005 || bmi >= 1e21) {
    throw new RangeError('Confira os valores de peso e altura informados.');
  }
  return { bmi, weightKg, heightMeters };
}

module.exports = { parsePositiveDecimal, calculateBmi };
