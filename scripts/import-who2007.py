"""Regera o JSON a partir do arquivo SAS oficial, sem baixar dados.

Ferramenta de manutenção: requer Python e pandas (não são dependências do app).
Fonte e hashes: docs/WHO2007.md. Não arredonda nem estima coeficientes.
"""
from pathlib import Path
import hashlib
import json
import pandas as pd

root = Path(__file__).resolve().parents[1]
source = root / 'docs/references/who2007/bfawho2007.sas7bdat'
frame = pd.read_sas(source)
result = {
    'reference': 'WHO Growth Reference 2007, BMI-for-age',
    'sourceUrl': 'https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/download-sas-macro.zip?sfvrsn=7282b9e1_0',
    'sourceFile': source.name,
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'columns': ['month', 'L', 'M', 'S'],
    'minAgeMonths': 61,
    'maxAgeMonthsExclusive': 229,
    'tables': {},
}
for code, sex in [(1, 'male'), (2, 'female')]:
    rows = frame[frame.SEX == code].sort_values('AGE')
    assert rows.AGE.tolist() == list(range(61, 230))
    result['tables'][sex] = [
        [int(r.AGE), float(r.L), float(r.M), float(r.S)]
        for r in rows.itertuples(index=False)
    ]
output = root / 'src/data/who2007/bmi-lms.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{output}: 338 linhas oficiais; mês 229 é a extensão terminal do arquivo da OMS.')
