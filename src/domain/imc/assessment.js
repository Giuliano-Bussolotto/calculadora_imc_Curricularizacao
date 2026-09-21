const { parseDateOnly, calculateAge, todayDateOnly } = require('./age');
const { calculateBmi } = require('./bmi');
const { classifyAdult } = require('./adult');
const { identifyProtocol } = require('./protocols');
const { assessWho2007 } = require('./who2007');

// Adicionar protocolos futuros aqui não exige colocar regras clínicas na tela.
const evaluators = {
  under5: () => ({ status: 'unsupported', classification: null, message: 'A avaliação para menores de 5 anos ainda não está disponível nesta versão.' }),
  who2007: ({ bmi, sex, age }) => assessWho2007(bmi, sex, age.whoMonths),
  adult: ({ bmi }) => ({ status: 'classified', classification: classifyAdult(bmi), reference: 'Adultos de 20 a 59 anos' }),
  olderAdult: () => ({ status: 'unsupported', classification: null, message: 'A avaliação específica para pessoas com 60 anos ou mais ainda não está disponível nesta versão.' }),
};

function assessBmi(input = {}, assessmentDate = todayDateOnly()) {
  const { birthDate, sex, weight, height } = input || {};
  if (typeof birthDate !== 'string' || !birthDate.trim()) {
    return { status: 'invalid', message: 'Informe a data de nascimento.' };
  }
  const birth = parseDateOnly(birthDate);
  if (!birth) return { status: 'invalid', message: 'Informe uma data de nascimento válida (DD/MM/AAAA).' };
  let age;
  try {
    age = calculateAge(birth.iso, assessmentDate);
  } catch (error) {
    return { status: 'invalid', message: error.message };
  }
  if (sex !== 'male' && sex !== 'female') {
    return { status: 'invalid', message: 'Selecione o sexo para a avaliação.' };
  }
  let measurements;
  try {
    measurements = calculateBmi(weight, height);
  } catch (error) {
    return { status: 'invalid', message: error.message };
  }
  const protocol = identifyProtocol(age);
  // Retém a data ISO como dado principal reutilizável por um futuro perfil.
  // Idade é sempre derivada na avaliação; nenhum perfil é salvo nesta etapa.
  const context = { birthDateISO: birth.iso, sex, age, protocol, ...measurements };
  return { ...context, ...evaluators[protocol](context) };
}

module.exports = { assessBmi };
