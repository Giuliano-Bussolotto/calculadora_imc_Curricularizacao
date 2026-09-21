const reference = require('../../data/who2007/bmi-lms.json');

function isReferenceAgeSupported(ageMonths) {
  // Cobertura: 61 a 228 meses completos, mantendo a fração da idade no cálculo LMS.
  return Number.isFinite(ageMonths) && ageMonths >= 61 && ageMonths < 229;
}

function interpolateLms(sex, ageMonths) {
  if (sex !== 'male' && sex !== 'female') throw new RangeError('Selecione o sexo da referência.');
  if (!isReferenceAgeSupported(ageMonths)) throw new RangeError('Idade fora da cobertura WHO 2007.');
  const month = Math.floor(ageMonths);
  const fraction = ageMonths - month;
  const table = reference.tables[sex];
  const lower = table[month - 61];
  const upper = table[month + 1 - 61];
  // Interpolação linear separada de L, M e S, conforme WHO2007.sas.
  // A linha 229, idêntica à 228, existe no arquivo oficial; não é extrapolação nossa.
  return {
    L: lower[1] + fraction * (upper[1] - lower[1]),
    M: lower[2] + fraction * (upper[2] - lower[2]),
    S: lower[3] + fraction * (upper[3] - lower[3]),
  };
}

function bmiAtZ(z, { L, M, S }) {
  return L === 0 ? M * Math.exp(S * z) : M * Math.pow(1 + L * S * z, 1 / L);
}

function calculateWhoZScore(bmi, sex, ageMonths) {
  if (!Number.isFinite(bmi) || bmi <= 0) throw new RangeError('IMC inválido.');
  const lms = interpolateLms(sex, ageMonths);
  const { L, M, S } = lms;
  const rawZ = L === 0 ? Math.log(bmi / M) / S : (Math.pow(bmi / M, L) - 1) / (L * S);
  // LMS restrito da OMS: além de ±3 DP, prolongamento pela distância 2↔3 DP.
  if (rawZ > 3) {
    const plus3 = bmiAtZ(3, lms);
    return 3 + (bmi - plus3) / (plus3 - bmiAtZ(2, lms));
  }
  if (rawZ < -3) {
    const minus3 = bmiAtZ(-3, lms);
    return -3 + (bmi - minus3) / (bmiAtZ(-2, lms) - minus3);
  }
  return rawZ;
}

function classifyWhoZScore(zScore) {
  if (!Number.isFinite(zScore)) throw new RangeError('Escore-Z inválido.');
  // Compensa apenas ruído IEEE-754 nos limites, sem arredondar o Z clínico.
  const z = [-3, -2, 1, 2].find(boundary => Math.abs(zScore - boundary) < 1e-12) ?? zScore;
  if (z < -3) return 'Magreza acentuada';
  if (z < -2) return 'Magreza';
  if (z > 2) return 'Obesidade';
  if (z > 1) return 'Sobrepeso';
  return 'Faixa adequada';
}

function assessWho2007(bmi, sex, ageMonths) {
  if (!isReferenceAgeSupported(ageMonths)) {
    return {
      status: 'unsupported', classification: null, zScore: null,
      message: 'A classificação WHO 2007 não está disponível para esta idade na implementação atual. A referência incorporada cobre de 61 a 228 meses completos. Solicite avaliação à equipe da clínica.',
    };
  }
  const zScore = calculateWhoZScore(bmi, sex, ageMonths);
  if (!Number.isFinite(zScore)) {
    return { status: 'review', classification: null, zScore: null, message: 'Confira a data de nascimento e as medidas antes de avaliar.' };
  }
  // A OMS sinaliza BAZ fora de [-5,+5] para revisão das medidas (WHO2007_SAS).
  if (zScore < -5 || zScore > 5) {
    return { status: 'review', classification: null, zScore, message: 'As medidas precisam ser conferidas pela equipe da clínica antes de apresentar uma classificação.' };
  }
  return { status: 'classified', classification: classifyWhoZScore(zScore), zScore, reference: 'WHO 2007 — IMC por idade e sexo' };
}

module.exports = { isReferenceAgeSupported, interpolateLms, bmiAtZ, calculateWhoZScore, classifyWhoZScore, assessWho2007 };
