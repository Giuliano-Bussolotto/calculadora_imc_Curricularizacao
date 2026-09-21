const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseDateOnly, todayDateOnly, calculateAge } = require('../src/domain/imc/age');
const { calculateBmi, parsePositiveDecimal } = require('../src/domain/imc/bmi');
const { identifyProtocol } = require('../src/domain/imc/protocols');
const { classifyAdult } = require('../src/domain/imc/adult');
const { assessBmi } = require('../src/domain/imc/assessment');
const { isReferenceAgeSupported, interpolateLms, bmiAtZ, calculateWhoZScore, classifyWhoZScore, assessWho2007 } = require('../src/domain/imc/who2007');
const reference = require('../src/data/who2007/bmi-lms.json');

for (const [birth, day, years, months] of [
  ['2006-09-20', '2026-09-19', 19, 11],
  ['2006-09-20', '2026-09-20', 20, 0],
  ['2006-09-20', '2026-09-21', 20, 0],
  ['2000-02-29', '2026-02-28', 25, 11],
  ['2000-02-29', '2026-03-01', 26, 0],
  ['2020-02-29', '2024-02-29', 4, 0],
  ['2026-09-20', '2026-09-20', 0, 0],
]) {
  test(`idade civil: ${birth} em ${day}`, () => {
    const age = calculateAge(birth, day);
    assert.equal(age.years, years);
    assert.equal(age.months, months);
    assert.equal(age.birthDateISO, birth);
  });
}

test('idade OMS mantém dias e meses fracionários sem depender de horário ou DST', () => {
  const age = calculateAge('2016-03-12', '2026-03-12');
  assert.equal(age.days, 3652);
  assert.equal(age.whoMonths, 3652 / 30.4375);
  assert.ok(!Number.isInteger(age.whoMonths));
  assert.equal(todayDateOnly(new Date(2026, 8, 20, 23, 59)), '2026-09-20');
  assert.deepEqual(calculateAge('20/09/2006', '20/09/2026'), calculateAge('2006-09-20', '2026-09-20'));
});

for (const invalid of ['', '31/02/2015', '29/02/2025', '31/04/2015', '00/01/2015', '01/13/2015', '2020-02-30', '1/1/2020', 'abcd', '0000-01-01', '2020-01-01T00:00:00Z', null, 2020]) {
  test(`data impossível ou malformada rejeitada: ${JSON.stringify(invalid)}`, () => assert.equal(parseDateOnly(invalid), null));
}

test('data futura rejeitada sem interromper a avaliação', () => {
  assert.throws(() => calculateAge('2026-09-21', '2026-09-20'), /futuro/);
  const result = assessBmi({ birthDate: '21/09/2026', sex: 'male', height: '175', weight: '70' }, '2026-09-20');
  assert.equal(result.status, 'invalid');
  assert.match(result.message, /futuro/);
});

for (const [birth, date, protocol, status] of [
  ['2021-09-20', '2026-09-19', 'under5', 'unsupported'],
  ['2021-09-20', '2026-09-20', 'who2007', 'unsupported'],
  ['2021-09-20', '2026-10-22', 'who2007', 'classified'],
  ['2007-09-20', '2026-09-19', 'who2007', 'classified'],
  ['2007-09-20', '2026-09-20', 'who2007', 'classified'],
  ['2007-09-20', '2026-11-20', 'who2007', 'unsupported'],
  ['2006-09-20', '2026-09-19', 'who2007', 'unsupported'],
  ['2006-09-20', '2026-09-20', 'adult', 'classified'],
  ['1966-09-20', '2026-09-19', 'adult', 'classified'],
  ['1966-09-20', '2026-09-20', 'olderAdult', 'unsupported'],
  ['1940-01-01', '2026-09-20', 'olderAdult', 'unsupported'],
]) {
  test(`transição de protocolo: ${birth} em ${date}`, () => {
    assert.equal(identifyProtocol(calculateAge(birth, date)), protocol);
    const result = assessBmi({ birthDate: birth, sex: 'male', height: '150', weight: '40' }, date);
    assert.equal(result.protocol, protocol);
    assert.equal(result.status, status);
    if (status === 'unsupported') {
      assert.equal(result.classification, null);
      assert.match(result.message, /não está disponível/);
      assert.equal(result.bmi, 40 / 1.5 ** 2);
      if (protocol === 'who2007') {
        assert.equal(result.zScore, null);
        assert.equal(result.reference, undefined);
        assert.match(result.message, /A classificação WHO 2007 não está disponível para esta idade na implementação atual/);
      }
    }
  });
}

for (const [bmi, label] of [
  [18.49999, 'Baixo peso'], [18.5, 'Peso adequado'], [24.99999, 'Peso adequado'],
  [25, 'Sobrepeso'], [29.99999, 'Sobrepeso'], [30, 'Obesidade grau I'],
  [34.99999, 'Obesidade grau I'], [35, 'Obesidade grau II'], [39.99999, 'Obesidade grau II'],
  [40, 'Obesidade grau III'], [80, 'Obesidade grau III'],
]) {
  test(`limite adulto sem arredondamento: ${bmi}`, () => assert.equal(classifyAdult(bmi), label));
}

for (const [bmi, ageMonths, z, category] of [
  [30, 132, 3.35, 'Obesidade'],
  [14, 192, -3.80, 'Magreza acentuada'],
  [19, 108, 1.47, 'Sobrepeso'],
]) {
  test(`exemplo publicado em computation.pdf: menino ${ageMonths} meses, IMC ${bmi}`, () => {
    const actual = calculateWhoZScore(bmi, 'male', ageMonths);
    // O PDF arredonda etapas intermediárias a 2 casas; os dados LMS não são arredondados aqui.
    assert.ok(Math.abs(actual - z) < 0.01, `${actual} versus ${z}`);
    assert.equal(classifyWhoZScore(actual), category);
  });
}

test('919 escores reproduzem os resultados oficiais do pacote SAS da OMS', () => {
  const text = fs.readFileSync(path.join(__dirname, 'fixtures/who2007-survey.csv'), 'utf8');
  const lines = text.trim().split(/\r?\n/);
  const fields = lines.shift().split(',');
  let checked = 0;
  let missing = 0;
  let oedemaCases = 0;
  let incompleteCases = 0;
  let maxDifference = 0;
  const sexes = new Set();
  for (const line of lines) {
    const row = Object.fromEntries(line.split(',').map((value, i) => [fields[i], value]));
    if (row._ZBFA === '') {
      if (row.oedema.toLowerCase() === 'y') oedemaCases++;
      else {
        assert.ok(row.weight === '' || row.height === '', `Resultado ausente sem motivo no ID=${row.id}`);
        assert.throws(() => calculateBmi(row.weight, row.height));
        incompleteCases++;
      }
      missing++;
      continue;
    }
    const sex = row.sex === '1' ? 'male' : 'female';
    const bmi = Number(row.weight) / (Number(row.height) / 100) ** 2;
    const actual = calculateWhoZScore(bmi, sex, Number(row._agemons));
    const difference = Math.abs(actual - Number(row._ZBFA));
    assert.ok(difference <= 0.005000001, `OMS ID=${row.id}: ${actual} versus ${row._ZBFA}`);
    maxDifference = Math.max(maxDifference, difference);
    checked++;
    sexes.add(sex);
  }
  assert.equal(checked, 919);
  assert.equal(missing, 14);
  assert.equal(oedemaCases, 5);
  assert.equal(incompleteCases, 9);
  assert.equal(sexes.size, 2);
  console.log(`Comparação OMS: ${checked} escores; maior diferença absoluta ${maxDifference.toFixed(12)} (saída oficial em 2 casas).`);
});

test('dados oficiais íntegros: 169 meses por sexo e hash do arquivo-fonte', () => {
  const source = fs.readFileSync(path.join(__dirname, '../docs/references/who2007/bfawho2007.sas7bdat'));
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), reference.sourceSha256);
  for (const sex of ['male', 'female']) {
    const rows = reference.tables[sex];
    assert.equal(rows.length, 169);
    assert.deepEqual(rows.map(row => row[0]), Array.from({ length: 169 }, (_, i) => i + 61));
    assert.deepEqual(rows[167].slice(1), rows[168].slice(1));
  }
  assert.deepEqual(interpolateLms('female', 61), { L: -0.8886, M: 15.2441, S: 0.09692 });
  assert.deepEqual(interpolateLms('male', 61), { L: -0.7387, M: 15.2641, S: 0.0839 });
});

test('idade fracionária interpola L, M e S, sem truncar para anos inteiros', () => {
  const x = interpolateLms('female', 61.5);
  assert.ok(Math.abs(x.L - (-0.8977)) < 1e-12);
  assert.ok(Math.abs(x.M - 15.24375) < 1e-12);
  assert.ok(Math.abs(x.S - 0.09715) < 1e-12);
  assert.notEqual(calculateWhoZScore(19, 'female', 61), calculateWhoZScore(19, 'female', 61.5));
});

for (const ageMonths of [61, 84.3, 108, 132, 192, 228, 228.999]) {
  for (const sex of ['male', 'female']) {
    test(`cobertura e limites Z em ${ageMonths} meses, ${sex}`, () => {
      const lms = interpolateLms(sex, ageMonths);
      for (const [z, category] of [[-3, 'Magreza'], [-2, 'Faixa adequada'], [1, 'Faixa adequada'], [2, 'Sobrepeso']]) {
        const bmi = bmiAtZ(z, lms);
        const actual = calculateWhoZScore(bmi, sex, ageMonths);
        assert.ok(Math.abs(actual - z) < 1e-12);
        assert.equal(classifyWhoZScore(actual), category);
      }
      assert.equal(assessWho2007(lms.M, sex, ageMonths).classification, 'Faixa adequada');
    });
  }
}

for (const [ageMonths, supported] of [[60, false], [61, true], [228, true], [229, false]]) {
  test(`cobertura operacional WHO: ${ageMonths} meses, ${supported ? 'dentro' : 'fora'}`, () => {
    assert.equal(isReferenceAgeSupported(ageMonths), supported);
    for (const sex of ['male', 'female']) {
      const result = assessWho2007(16, sex, ageMonths);
      assert.equal(result.status, supported ? 'classified' : 'unsupported');
      if (supported) {
        assert.ok(Number.isFinite(result.zScore));
        assert.ok(result.classification);
        assert.equal(result.reference, 'WHO 2007 — IMC por idade e sexo');
      } else {
        assert.equal(result.classification, null);
        assert.equal(result.zScore, null);
        assert.equal(result.reference, undefined);
        assert.match(result.message, /A classificação WHO 2007 não está disponível para esta idade na implementação atual/);
        assert.throws(() => calculateWhoZScore(16, sex, ageMonths), /cobertura/);
      }
    }
  });
}

for (const ageMonths of [60, 60.999999, 229, 239.99, NaN]) {
  test(`sem extrapolação fora da referência: ${ageMonths} meses`, () => {
    assert.equal(assessWho2007(22, 'male', ageMonths).status, 'unsupported');
    assert.throws(() => calculateWhoZScore(22, 'male', ageMonths), /cobertura/);
  });
}

for (const [z, expected] of [[-3.00001, 'Magreza acentuada'], [-2.00001, 'Magreza'], [1.00001, 'Sobrepeso'], [2.00001, 'Obesidade']]) {
  test(`limiar WHO estrito: ${z}`, () => assert.equal(classifyWhoZScore(z), expected));
}

test('não compara IMC bruto com limites adultos ou com desvios-padrão', () => {
  assert.equal(classifyAdult(19), 'Peso adequado');
  assert.equal(assessWho2007(19, 'male', 108).classification, 'Sobrepeso');
  assert.notEqual(calculateWhoZScore(19, 'male', 108), calculateWhoZScore(19, 'female', 108));
});

test('valores sinalizados pela OMS pedem revisão, sem classificação automática', () => {
  const result = assessWho2007(181.3 / (1.7 ** 2), 'male', 187.34);
  assert.equal(result.status, 'review');
  assert.equal(result.classification, null);
  assert.ok(result.zScore > 5);
});

test('dados demográficos obrigatórios e inválidos não quebram o app', () => {
  for (const value of [undefined, null, {}, { birthDate: '' }, { birthDate: '31/02/2020' }, { birthDate: '20/09/1990', sex: '' }, { birthDate: '20/09/1990', sex: 'unknown' }]) {
    assert.equal(assessBmi(value, '2026-09-20').status, 'invalid');
  }
});

test('decimais com vírgula e ponto, inteiros e centímetros continuam equivalentes', () => {
  for (const weight of ['70', '70,5', '70.5']) {
    for (const height of ['175', '1,75', '1.75']) {
      const expectedWeight = weight === '70' ? 70 : 70.5;
      assert.equal(calculateBmi(weight, height).bmi, expectedWeight / 1.75 ** 2);
    }
  }
  assert.equal(calculateBmi('80', '2').bmi, 20);
});

for (const bad of ['', ' ', '0', '-1', '70kg', '70,5.0', '1,7,5', 'Infinity', '1e2', null, 70]) {
  test(`número inválido: ${JSON.stringify(bad)}`, () => {
    assert.equal(parsePositiveDecimal(bad), null);
    assert.throws(() => calculateBmi(bad, '175'));
    assert.throws(() => calculateBmi('70', bad));
  });
}
