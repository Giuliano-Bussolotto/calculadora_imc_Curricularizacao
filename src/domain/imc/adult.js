// Textos centralizados para futura revisão de nomenclatura pela clínica.
const ADULT_CATEGORIES = Object.freeze([
  { below: 18.5, label: 'Baixo peso' },
  { below: 25, label: 'Peso adequado' },
  { below: 30, label: 'Sobrepeso' },
  { below: 35, label: 'Obesidade grau I' },
  { below: 40, label: 'Obesidade grau II' },
  { below: Infinity, label: 'Obesidade grau III' },
]);

function classifyAdult(bmi) {
  if (!Number.isFinite(bmi) || bmi <= 0) throw new RangeError('IMC inválido.');
  return ADULT_CATEGORIES.find(category => bmi < category.below).label;
}

module.exports = { ADULT_CATEGORIES, classifyAdult };
