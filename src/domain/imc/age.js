const MILLISECONDS_PER_DAY = 86400000;
const WHO_DAYS_PER_MONTH = 30.4375;

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const brazilian = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!iso && !brazilian) return null;
  const [year, month, day] = iso
    ? iso.slice(1).map(Number)
    : [Number(brazilian[3]), Number(brazilian[2]), Number(brazilian[1])];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  // UTC é apenas a representação da data civil: sem hora de nascimento ou DST.
  // setUTCFullYear evita a conversão automática dos anos 00–99 para 1900–1999.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day, dayNumber: date.getTime() / MILLISECONDS_PER_DAY,
    iso: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
}

function todayDateOnly(now = new Date()) {
  // Hoje é a data local do aparelho. Nenhuma conversão do horário local para UTC.
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function calculateAge(birthDate, assessmentDate = todayDateOnly()) {
  const birth = parseDateOnly(birthDate);
  const assessment = parseDateOnly(assessmentDate);
  if (!birth || !assessment) throw new RangeError('Data inválida.');
  const days = assessment.dayNumber - birth.dayNumber;
  if (days < 0) throw new RangeError('A data de nascimento não pode estar no futuro.');
  let completedMonths = (assessment.year - birth.year) * 12 + assessment.month - birth.month;
  if (assessment.day < birth.day) completedMonths--;
  // Para nascimento em 29/02, em anos não bissextos a virada ocorre em 01/03.
  // Faixas do produto usam aniversários civis; a referência OMS usa meses fracionários.
  return {
    years: Math.floor(completedMonths / 12),
    months: completedMonths % 12,
    days,
    whoMonths: days / WHO_DAYS_PER_MONTH,
    birthDateISO: birth.iso,
    assessmentDateISO: assessment.iso,
  };
}

module.exports = { parseDateOnly, todayDateOnly, calculateAge, WHO_DAYS_PER_MONTH };
