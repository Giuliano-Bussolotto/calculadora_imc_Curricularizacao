const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const babel = require('@babel/core');
const { assessBmi } = require('../src/domain/imc/assessment');

// Testes de lógica/eventos com hooks simulados. Não substituem renderização nativa.
// Os transformadores Babel já são instalados pelo Expo; não há dependências novas.
function renderComponent(file, { imports = {}, native = {} } = {}) {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => {
        slots[index] = typeof value === 'function' ? value(slots[index]) : value;
      }];
    },
    useEffect(create, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: create() };
        });
      }
    },
  };
  const reactNative = {
    ...Object.fromEntries([
      'Button', 'KeyboardAvoidingView', 'Pressable', 'ScrollView', 'Text', 'TextInput', 'View',
    ].map(name => [name, name])),
    Platform: { OS: 'android' },
    StatusBar: Object.assign(function StatusBar() {}, { currentHeight: 24 }),
    StyleSheet: { create: styles => styles },
    Keyboard: { dismiss() {} },
    Alert: { alert() {} },
    ...native,
  };
  const { code } = babel.transformSync(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    filename: file,
    configFile: false,
    babelrc: false,
    plugins: [
      [require.resolve('@babel/plugin-transform-react-jsx'), { runtime: 'automatic' }],
      require.resolve('@babel/plugin-transform-modules-commonjs'),
    ],
  });
  const jsx = (type, props) => ({ type, props });
  const context = {
    exports: {},
    require(name) {
      if (name === 'react') return react;
      if (name === 'react-native') return reactNative;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name in imports) return imports[name];
      throw new Error(`Import não simulado: ${name}`);
    },
  };
  vm.runInNewContext(code, context);
  return {
    render(props = {}) {
      cursor = 0;
      effects = [];
      const tree = context.exports.default(props);
      effects.forEach(effect => effect());
      return tree;
    },
    unmount() {
      slots.forEach(slot => slot?.cleanup?.());
    },
  };
}

function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  return [
    ...(predicate(tree) ? [tree] : []),
    ...[].concat(tree.props?.children || []).flatMap(child => nodes(child, predicate)),
  ];
}
function byLabel(tree, label) {
  const matches = nodes(tree, node => node.props?.accessibilityLabel === label);
  assert.equal(matches.length, 1, `Esperado um elemento: ${label}`);
  return matches[0];
}
function input(tree) {
  return nodes(tree, node => node.type === 'TextInput')[0];
}
function login(options = {}) {
  return renderComponent('src/screens/LoginScreen.js', {
    imports: { '../components/ClinicLogo': 'ClinicLogo' },
    ...options,
  });
}
function calculator() {
  return renderComponent('src/screens/CalculatorScreen.js', {
    imports: { '../domain/imc/assessment': { assessBmi: input => assessBmi(input, '2026-09-20') } },
  });
}
function calculate(component, weight, height, { birthDate = '20/09/1996', sex = 'male' } = {}) {
  const tree = component.render();
  const fields = nodes(tree, node => node.type === 'TextInput');
  assert.equal(fields[0].props.accessibilityLabel, 'Data de nascimento');
  assert.equal(fields[1].props.accessibilityLabel, 'Altura em metros');
  assert.equal(fields[2].props.accessibilityLabel, 'Peso em quilogramas');
  fields[0].props.onChangeText(birthDate);
  byLabel(component.render(), sex === 'male' ? 'Masculino — referência meninos' : 'Feminino — referência meninas').props.onPress();
  fields[1].props.onChangeText(height);
  fields[2].props.onChangeText(weight);
  nodes(component.render(), node => node.type === 'Button')[0].props.onPress();
  return nodes(component.render(), node => node.props?.accessibilityLiveRegion === 'polite')[0].props.children;
}

test('login começa por telefone e reserva espaço para a logo', () => {
  const tree = login().render();
  assert.equal(input(tree).props.keyboardType, 'phone-pad');
  assert.equal(input(tree).props.autoComplete, 'tel');
  assert.equal(byLabel(tree, 'Acessar com telefone').props.accessibilityState.selected, true);
  assert.equal(nodes(tree, node => node.type === 'ClinicLogo').length, 1);
});

test('trocar telefone/e-mail mantém os respectivos valores e configura o teclado', () => {
  const component = login();
  input(component.render()).props.onChangeText('11999999999');
  byLabel(component.render(), 'Acessar com e-mail').props.onPress();
  let tree = component.render();
  assert.equal(input(tree).props.keyboardType, 'email-address');
  assert.equal(input(tree).props.autoCapitalize, 'none');
  assert.equal(input(tree).props.autoCorrect, false);
  assert.equal(byLabel(tree, 'Acessar com e-mail').props.accessibilityState.selected, true);
  input(tree).props.onChangeText('teste@example.com');
  byLabel(component.render(), 'Acessar com telefone').props.onPress();
  assert.equal(input(component.render()).props.value, '11999999999');
  byLabel(component.render(), 'Acessar com e-mail').props.onPress();
  assert.equal(input(component.render()).props.value, 'teste@example.com');
});

for (const method of ['telefone', 'e-mail']) {
  test(`Continuar com ${method} vazio abre o fluxo demonstrativo sem enviar dados`, () => {
    let continued = 0;
    let dismissed = 0;
    const component = login({ native: { Keyboard: { dismiss() { dismissed++; } } } });
    const props = { onContinue(...args) { assert.equal(args.length, 0); continued++; } };
    byLabel(component.render(props), `Acessar com ${method}`).props.onPress();
    byLabel(component.render(props), 'Continuar').props.onPress();
    assert.equal(continued, 1);
    assert.equal(dismissed, 1);
  });
}

test('Criar conta apenas informa que o cadastro será disponibilizado depois', () => {
  let notice;
  const component = login({ native: { Alert: { alert(...args) { notice = args; } } } });
  byLabel(component.render({ onContinue() { assert.fail('Não deve navegar'); } }), 'Criar conta').props.onPress();
  assert.equal(notice[0], 'Criar conta');
  assert.match(notice[1], /próxima etapa/);
});

test('login permite rolagem, espaço para a barra Android e alvos de toque de 48 pontos', () => {
  const tree = login().render();
  const scroll = nodes(tree, node => node.type === 'ScrollView')[0];
  assert.equal(scroll.props.keyboardShouldPersistTaps, 'handled');
  assert.ok(scroll.props.contentContainerStyle.paddingTop > 24);
  assert.ok(scroll.props.contentContainerStyle.paddingBottom >= 32);
  for (const node of nodes(tree, element => element.type === 'Pressable')) {
    const style = Object.assign({}, ...node.props.style({ pressed: false }).filter(Boolean));
    assert.ok(style.minHeight >= 48);
  }
});

test('fluxo Login → Calculadora calcula IMC; voltar do Android retorna ao login', () => {
  const listeners = new Set();
  const navigator = renderComponent('src/navigation/AppNavigator.js', {
    imports: { '../screens/LoginScreen': 'LoginScreen', '../screens/CalculatorScreen': 'CalculatorScreen' },
    native: { BackHandler: { addEventListener(event, handler) {
      assert.equal(event, 'hardwareBackPress');
      listeners.add(handler);
      return { remove() { listeners.delete(handler); } };
    } } },
  });
  const initial = navigator.render();
  assert.equal(initial.type, 'LoginScreen');
  assert.equal(listeners.size, 0);
  byLabel(login().render(initial.props), 'Continuar').props.onPress();
  assert.equal(navigator.render().type, 'CalculatorScreen');
  assert.equal(listeners.size, 1);
  assert.equal(calculate(calculator(), '70', '175'), 'Idade: 30 anos e 0 meses\nIMC: 22,86\nClassificação (adultos): Peso adequado.');
  assert.equal([...listeners][0](), true);
  assert.equal(navigator.render().type, 'LoginScreen');
  assert.equal(listeners.size, 0);
  navigator.render().props.onContinue();
  navigator.render();
  navigator.unmount();
  assert.equal(listeners.size, 0);
});

for (const weight of ['70', '70,5', '70.5']) {
  for (const height of ['175', '1,75', '1.75']) {
    test(`calculadora preservada: peso ${weight}, altura ${height}`, () => {
      const value = weight === '70' ? '22,86' : '23,02';
      assert.equal(calculate(calculator(), weight, height), `Idade: 30 anos e 0 meses\nIMC: ${value}\nClassificação (adultos): Peso adequado.`);
    });
  }
}

for (const [bmi, category] of [
  [17, 'Baixo peso'], [18.49, 'Baixo peso'], [18.499, 'Baixo peso'],
  [18.5, 'Peso adequado'], [24.99, 'Peso adequado'], [24.999, 'Peso adequado'],
  [25, 'Sobrepeso'], [29.99, 'Sobrepeso'], [29.999, 'Sobrepeso'],
  [30, 'Obesidade grau I'], [34.99, 'Obesidade grau I'],
  [35, 'Obesidade grau II'], [39.99, 'Obesidade grau II'],
  [40, 'Obesidade grau III'], [45, 'Obesidade grau III'],
]) {
  test(`classificação preservada no IMC ${bmi}`, () => {
    assert.ok(calculate(calculator(), String(bmi * 4), '2').endsWith(`Classificação (adultos): ${category}.`));
  });
}

for (const [weight, height] of [
  ['', '1.75'], ['70', ''], ['0', '1.75'], ['70', '0'], ['-70', '1.75'],
  ['70', '-1.75'], ['abc', '1.75'], ['70kg', '1.75'], ['70', '1,7,5'], ['Infinity', '1.75'],
]) {
  test(`entrada inválida preservada: peso ${JSON.stringify(weight)}, altura ${JSON.stringify(height)}`, () => {
    assert.equal(calculate(calculator(), weight, height), 'Informe peso e altura válidos, maiores que zero.');
  });
}

test('editar altura ou peso substitui o resultado antigo da calculadora', () => {
  const component = calculator();
  for (const label of ['Altura em metros', 'Peso em quilogramas']) {
    calculate(component, '70', '175');
    byLabel(component.render(), label).props.onChangeText('80');
    const result = nodes(component.render(), node => node.props?.accessibilityLiveRegion === 'polite')[0];
    assert.equal(result.props.children, 'Toque em Calcular para ver o resultado.');
  }
});


test('campos na ordem nascimento, sexo, altura, peso e calcular, sem sexo inferido', () => {
  const tree = calculator().render();
  const controls = nodes(tree, node => ['TextInput', 'Pressable', 'Button'].includes(node.type));
  assert.deepEqual(controls.map(node => node.props.accessibilityLabel || node.props.title), [
    'Data de nascimento', 'Masculino — referência meninos', 'Feminino — referência meninas',
    'Altura em metros', 'Peso em quilogramas', 'Calcular',
  ]);
  assert.equal(controls[1].props.accessibilityState.checked, false);
  assert.equal(controls[2].props.accessibilityState.checked, false);
});

test('máscara de nascimento aceita oito dígitos e datas impossíveis são rejeitadas', () => {
  const component = calculator();
  byLabel(component.render(), 'Data de nascimento').props.onChangeText('31022015');
  assert.equal(byLabel(component.render(), 'Data de nascimento').props.value, '31/02/2015');
  nodes(component.render(), node => node.type === 'Button')[0].props.onPress();
  assert.match(nodes(component.render(), node => node.props?.accessibilityLiveRegion === 'polite')[0].props.children, /data de nascimento válida/);
});

test('criança tem idade, IMC e classificação WHO 2007 sem mostrar o Z técnico', () => {
  const result = calculate(calculator(), '30', '130', { birthDate: '20/09/2016', sex: 'female' });
  assert.match(result, /Idade: 10 anos/);
  assert.match(result, /IMC: 17,75/);
  assert.match(result, /Classificação IMC por idade/);
  assert.match(result, /WHO 2007/);
  assert.doesNotMatch(result, /Escore|Z-score/);
});

for (const [birthDate, message] of [
  ['20/09/2023', 'A avaliação para menores de 5 anos ainda não está disponível nesta versão.'],
  ['20/09/2021', 'A classificação WHO 2007 não está disponível para esta idade na implementação atual. A referência incorporada cobre de 61 a 228 meses completos. Solicite avaliação à equipe da clínica.'],
  ['20/03/2007', 'A classificação WHO 2007 não está disponível para esta idade na implementação atual. A referência incorporada cobre de 61 a 228 meses completos. Solicite avaliação à equipe da clínica.'],
  ['20/09/1966', 'A avaliação específica para pessoas com 60 anos ou mais ainda não está disponível nesta versão.'],
  ['20/09/1946', 'A avaliação específica para pessoas com 60 anos ou mais ainda não está disponível nesta versão.'],
]) {
  for (const sex of ['male', 'female']) {
    test(`faixa não suportada exibe somente aviso: ${birthDate}, ${sex}`, () => {
      const result = calculate(calculator(), '40', '150', { birthDate, sex });
      assert.equal(result, message);
      assert.doesNotMatch(result, /IMC:|Idade:|Classificação \(adultos\):|Classificação IMC por idade:|Referência:/);
    });
  }
}

test('trocar faixa suportada por não suportada remove o IMC e a classificação anteriores', () => {
  const component = calculator();
  assert.match(calculate(component, '70', '175'), /IMC: 22,86/);
  const unsupported = calculate(component, '70', '175', { birthDate: '20/09/1966' });
  assert.equal(unsupported, 'A avaliação específica para pessoas com 60 anos ou mais ainda não está disponível nesta versão.');
  const pediatric = calculate(component, '30', '130', { birthDate: '20/09/2016', sex: 'female' });
  assert.match(pediatric, /Idade: 10 anos/);
  assert.match(pediatric, /IMC: 17,75/);
  assert.match(pediatric, /Classificação IMC por idade:.*\nReferência: WHO 2007\./);
  const outsideCoverage = calculate(component, '30', '130', { birthDate: '20/09/2021', sex: 'female' });
  assert.match(outsideCoverage, /^A classificação WHO 2007 não está disponível/);
  assert.doesNotMatch(outsideCoverage, /IMC:|Idade:|Classificação IMC por idade:|Referência:/);
  assert.equal(calculate(component, '70', '175'), 'Idade: 30 anos e 0 meses\nIMC: 22,86\nClassificação (adultos): Peso adequado.');
});

test('editar data de nascimento ou sexo invalida o resultado anterior', () => {
  const component = calculator();
  calculate(component, '70', '175');
  byLabel(component.render(), 'Data de nascimento').props.onChangeText('20092015');
  assert.equal(nodes(component.render(), node => node.props?.accessibilityLiveRegion === 'polite')[0].props.children, 'Toque em Calcular para ver o resultado.');
  calculate(component, '70', '175');
  byLabel(component.render(), 'Feminino — referência meninas').props.onPress();
  assert.equal(nodes(component.render(), node => node.props?.accessibilityLiveRegion === 'polite')[0].props.children, 'Toque em Calcular para ver o resultado.');
});
