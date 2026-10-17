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
      'Button', 'KeyboardAvoidingView', 'Pressable', 'SafeAreaView', 'ScrollView', 'Text', 'TextInput', 'View',
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
    imports: {
      '../components/ClinicLogo': 'ClinicLogo',
      '../theme': { colors: {}, shadows: { card: {} } },
    },
    ...options,
  });
}
function calculator() {
  return renderComponent('src/screens/CalculatorScreen.js', {
    imports: {
      '../domain/imc/assessment': { assessBmi: input => assessBmi(input, '2026-09-20') },
      '../theme': { colors: { primary: '#087BEA' }, shadows: { card: {} } },
    },
  });
}

test('cargos da clínica ficam centralizados e permitem abrir o fluxo de nova função', () => {
  const { roles, getRole } = require('../src/domain/access/roles');
  assert.deepEqual(roles.map(role => role.id), [
    'admin', 'supervisor', 'doctor', 'nutritionist', 'pilates_teacher', 'psychologist', 'patient', 'public',
  ]);
  assert.equal(getRole('doctor').name, 'Médico');
  assert.equal(getRole('unknown'), null);

  let notice;
  const component = renderComponent('src/screens/RolesScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../domain/access/roles': { roles },
      '../domain/access/supervisorCreation': require('../src/domain/access/supervisorCreation'),
      '../theme': { colors: {}, shadows: { card: {} } },
    },
    native: { Alert: { alert(...args) { notice = args; } } },
  });
  let selected;
  const tree = component.render({ onBack() {}, onSelectRole(roleId) { selected = roleId; } });
  assert.equal(nodes(tree, node => /^Ver permissões de /.test(node.props?.accessibilityLabel || '')).length, roles.length);
  byLabel(tree, 'Ver permissões de Psicóloga').props.onPress();
  assert.equal(selected, 'psychologist');
  byLabel(tree, 'Criar nova função').props.onPress();
  assert.equal(notice[0], 'Criar nova função');
  assert.match(notice[1], /backend/);
});

test('somente o ADM Giuliano pode criar Supervisor/Diretor e atribuir ADM', () => {
  const { CURRENT_ADMIN_AUTHORIZERS, canAssignAdmin, canCreateSupervisor } = require('../src/domain/access/supervisorCreation');
  assert.deepEqual(CURRENT_ADMIN_AUTHORIZERS.map(user => user.name), ['Giuliano']);
  assert.equal(canCreateSupervisor({ id: 'admin-giuliano', role: 'admin' }), true);
  assert.equal(canAssignAdmin({ id: 'admin-giuliano', role: 'admin' }), true);
  assert.equal(canCreateSupervisor({ id: 'supervisor-yenny', role: 'supervisor' }), false);
  assert.equal(canAssignAdmin({ id: 'supervisor-yenny', role: 'supervisor' }), false);
  assert.equal(canCreateSupervisor({ id: 'supervisor-yohgenson', role: 'supervisor' }), false);
  assert.equal(canCreateSupervisor({ id: 'supervisor-new', role: 'supervisor' }), false);
  assert.equal(canCreateSupervisor({ id: 'admin-giuliano', role: 'doctor' }), false);

  let notice;
  const { roles } = require('../src/domain/access/roles');
  const component = renderComponent('src/screens/RolesScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../domain/access/roles': { roles },
      '../domain/access/supervisorCreation': { canAssignAdmin, canCreateSupervisor },
      '../theme': { colors: {}, shadows: { card: {} } },
    },
    native: { Alert: { alert(...args) { notice = args; } } },
  });
  const authorized = component.render({ onBack() {}, onSelectRole() {}, currentUser: { id: 'admin-giuliano', role: 'admin' } });
  byLabel(authorized, 'Criar novo Supervisor ou Diretor').props.onPress();
  assert.equal(notice[0], 'Novo Supervisor/Diretor');
  byLabel(authorized, 'Atribuir cargo de ADM').props.onPress();
  assert.equal(notice[0], 'Atribuir cargo de ADM');

  const blocked = component.render({ onBack() {}, onSelectRole() {}, currentUser: { id: 'supervisor-new', role: 'supervisor' } });
  assert.equal(nodes(blocked, node => node.props?.accessibilityLabel === 'Criar novo Supervisor ou Diretor').length, 0);
  assert.equal(nodes(blocked, node => node.props?.accessibilityLabel === 'Atribuir cargo de ADM').length, 0);
});

test('Psicóloga acessa somente solicitações de edição e menções', () => {
  const { canAccessModule, permissionsFor } = require('../src/domain/access/permissions');
  assert.deepEqual(permissionsFor('psychologist').modules, ['edit_requests', 'mentions']);
  assert.equal(canAccessModule('psychologist', 'edit_requests'), true);
  assert.equal(canAccessModule('psychologist', 'mentions'), true);
  assert.equal(canAccessModule('psychologist', 'agenda'), false);
  assert.equal(permissionsFor('psychologist').canViewPersonalData, false);
});

test('dados pessoais e agendas ficam visíveis apenas ao proprietário ou ADM', () => {
  const { canViewOwnedResource, visibleOwnedResources } = require('../src/domain/access/privacy');
  const ana = { id: 'patient-ana', role: 'patient' };
  const doctor = { id: 'doctor-1', role: 'doctor' };
  const admin = { id: 'admin-giuliano', role: 'admin' };
  const supervisor = { id: 'supervisor-1', role: 'supervisor' };
  const resources = [
    { id: 'a', type: 'appointment', ownerId: 'patient-ana' },
    { id: 'b', type: 'notification', ownerId: 'doctor-1' },
    { id: 'c', type: 'history', ownerId: 'patient-bia' },
  ];

  assert.equal(canViewOwnedResource(ana, resources[0]), true);
  assert.equal(canViewOwnedResource(doctor, resources[0]), false);
  assert.deepEqual(visibleOwnedResources(ana, resources).map(item => item.id), ['a']);
  assert.deepEqual(visibleOwnedResources(doctor, resources).map(item => item.id), ['b']);
  assert.deepEqual(visibleOwnedResources(admin, resources).map(item => item.id), ['a', 'b', 'c']);
  assert.deepEqual(visibleOwnedResources(supervisor, resources).map(item => item.id), []);
  assert.equal(canViewOwnedResource(ana, { type: 'unknown', ownerId: ana.id }), false);
});

test('edição de publicações de terceiros sempre exige solicitação profissional', () => {
  const { editMode, canEditPost, canRequestPostEdit } = require('../src/domain/feed/postPermissions');
  const post = { authorId: 'nutritionist-1', mentionedUserIds: ['doctor-mentioned'] };
  const author = { id: 'nutritionist-1', role: 'nutritionist' };
  const mentionedDoctor = { id: 'doctor-mentioned', role: 'doctor' };
  const otherDoctor = { id: 'doctor-other', role: 'doctor' };
  const patient = { id: 'patient-1', role: 'patient' };

  assert.equal(editMode(author, post), 'direct');
  assert.equal(canEditPost(mentionedDoctor, post), false);
  assert.equal(canRequestPostEdit(mentionedDoctor, post), true);
  assert.equal(canRequestPostEdit(otherDoctor, post), true);
  assert.equal(editMode(patient, post), 'none');
  assert.equal(canEditPost(patient, post), false);
});

test('solicitação de edição é privada entre autor e solicitante', () => {
  const { canViewEditRequest } = require('../src/domain/feed/postPermissions');
  const request = { requesterId: 'nutritionist-1', postAuthorId: 'doctor-1' };
  assert.equal(canViewEditRequest({ id: 'nutritionist-1', role: 'nutritionist' }, request), true);
  assert.equal(canViewEditRequest({ id: 'doctor-1', role: 'doctor' }, request), true);
  assert.equal(canViewEditRequest({ id: 'pilates-1', role: 'pilates_teacher' }, request), false);
  assert.equal(canViewEditRequest({ id: 'admin-1', role: 'supervisor' }, request), false);
});

test('botão de solicitação de edição confirma o envio e evita repetição', () => {
  const component = renderComponent('src/screens/FeedScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../domain/feed/postPermissions': require('../src/domain/feed/postPermissions'),
      '../theme': { colors: {}, shadows: { card: {} } },
    },
  });
  const props = { currentUser: { id: 'doctor-other', role: 'doctor' } };
  const button = byLabel(component.render(props), 'Solicitar edição da publicação');
  assert.equal(button.props.disabled, false);
  button.props.onPress();
  const sent = byLabel(component.render(props), 'Solicitar edição da publicação');
  assert.equal(sent.props.disabled, true);
  assert.equal(nodes(sent, node => node.type === 'Text')[0].props.children, 'Solicitação enviada');
});

test('Paciente edita somente a própria publicação e não salva conteúdo vazio', () => {
  const component = renderComponent('src/screens/FeedScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../domain/feed/postPermissions': require('../src/domain/feed/postPermissions'),
      '../theme': { colors: {}, shadows: { card: {} } },
    },
  });
  const props = { currentUser: { id: 'patient-ana', role: 'patient' } };
  let tree = component.render(props);
  assert.equal(nodes(tree, node => /edição da publicação/.test(node.props?.accessibilityLabel || '')).length, 0);
  byLabel(tree, 'Editar minha publicação').props.onPress();
  tree = component.render(props);
  const field = byLabel(tree, 'Texto da minha publicação');
  field.props.onChangeText('  Minha evolução desta semana.  ');
  byLabel(component.render(props), 'Salvar minha publicação').props.onPress();
  tree = component.render(props);
  assert.equal(nodes(tree, node => node.type === 'Text' && node.props.children === 'Minha evolução desta semana.').length, 1);

  byLabel(tree, 'Editar minha publicação').props.onPress();
  byLabel(component.render(props), 'Texto da minha publicação').props.onChangeText('   ');
  assert.equal(byLabel(component.render(props), 'Salvar minha publicação').props.disabled, true);
});

test('Feed não oferece comentários no escopo atual do produto', () => {
  const component = renderComponent('src/screens/FeedScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../domain/feed/postPermissions': require('../src/domain/feed/postPermissions'),
      '../theme': { colors: {}, shadows: { card: {} } },
    },
  });
  const tree = component.render({ currentUser: { id: 'patient-ana', role: 'patient' } });
  assert.equal(nodes(tree, node => /coment/i.test(node.props?.accessibilityLabel || '')).length, 0);
});

test('notificações incluem consulta automática e preferências essenciais funcionais', () => {
  const component = renderComponent('src/screens/NotificationsScreen.js', {
    imports: {
      '../components/AppIcon': 'AppIcon',
      '../theme': { colors: {}, shadows: { card: {} } },
    },
  });
  let tree = component.render();
  assert.equal(byLabel(tree, 'Lembrete automático de consulta ativo').type, 'View');
  assert.equal(byLabel(tree, 'Lembrete de Hidratação').props.accessibilityState.checked, true);
  assert.equal(byLabel(tree, 'Lembrete de Caminhadas').props.accessibilityState.checked, false);
  assert.equal(byLabel(tree, 'Lembrete de Exercícios').props.accessibilityState.checked, true);

  byLabel(tree, 'Lembrete de Caminhadas').props.onPress();
  tree = component.render();
  assert.equal(byLabel(tree, 'Lembrete de Caminhadas').props.accessibilityState.checked, true);
});
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
  byLabel(component.render(), 'Calcular').props.onPress();
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

test('fluxo Login → Início → Calculadora calcula IMC; voltar retorna ao início', () => {
  const listeners = new Set();
  const navigator = renderComponent('src/navigation/AppNavigator.js', {
    imports: {
      '../components/BottomNavigation': 'BottomNavigation',
      '../screens/AgendaScreen': 'AgendaScreen',
      '../screens/LoginScreen': 'LoginScreen',
      '../screens/NotificationsScreen': 'NotificationsScreen',
      '../screens/HomeScreen': 'HomeScreen',
      '../screens/CalculatorScreen': 'CalculatorScreen',
      '../screens/FeedScreen': 'FeedScreen',
      '../screens/PlaceholderScreen': 'PlaceholderScreen',
      '../screens/PermissionsScreen': 'PermissionsScreen',
      '../screens/RolesScreen': 'RolesScreen',
      '../theme': { colors: {} },
    },
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
  let shell = navigator.render();
  assert.equal(nodes(shell, node => node.type === 'HomeScreen').length, 1);
  assert.equal(listeners.size, 1);
  nodes(shell, node => node.type === 'BottomNavigation')[0].props.onNavigate('calculator');
  shell = navigator.render();
  assert.equal(nodes(shell, node => node.type === 'CalculatorScreen').length, 1);
  assert.equal(calculate(calculator(), '70', '175'), 'Idade: 30 anos e 0 meses\nIMC: 22,86\nClassificação (adultos): Peso adequado.');
  assert.equal([...listeners][0](), true);
  assert.equal(nodes(navigator.render(), node => node.type === 'HomeScreen').length, 1);
  assert.equal(listeners.size, 1);
  nodes(navigator.render(), node => node.type === 'BottomNavigation')[0].props.onNavigate('agenda');
  assert.equal(nodes(navigator.render(), node => node.type === 'AgendaScreen').length, 1);
  nodes(navigator.render(), node => node.type === 'BottomNavigation')[0].props.onNavigate('feed');
  assert.equal(nodes(navigator.render(), node => node.type === 'FeedScreen').length, 1);
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
    'Altura em metros', 'Peso em quilogramas', 'Calcular', 'Limpar campos',
  ]);
  assert.equal(controls[1].props.accessibilityState.checked, false);
  assert.equal(controls[2].props.accessibilityState.checked, false);
});

test('máscara de nascimento aceita oito dígitos e datas impossíveis são rejeitadas', () => {
  const component = calculator();
  byLabel(component.render(), 'Data de nascimento').props.onChangeText('31022015');
  assert.equal(byLabel(component.render(), 'Data de nascimento').props.value, '31/02/2015');
  byLabel(component.render(), 'Calcular').props.onPress();
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

test('resultado mostra explicação do card de mensagem de motivação', () => {
  const component = calculator();
  const label = 'Mensagem de motivação após o resultado';
  assert.equal(nodes(component.render(), node => node.props?.accessibilityLabel === label).length, 0);
  calculate(component, '70', '175');
  const card = byLabel(component.render(), label);
  assert.equal(card.type, 'View');
  assert.deepEqual(nodes(card, node => node.type === 'Text').map(node => node.props.children), [
    'Mensagem de motivação',
    'Após o cálculo, uma mensagem de motivação será exibida aqui junto ao seu resultado.',
  ]);
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
