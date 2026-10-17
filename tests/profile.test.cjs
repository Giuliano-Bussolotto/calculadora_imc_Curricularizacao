const assert = require('node:assert/strict');
const { test } = require('node:test');
const { demoUser, createProfileData, togglePost, updateOwnPost, recordBmi, canCompleteAppointment, completeAppointment, profileCollections, validatePasswordForm } = require('../src/domain/profile/profileData');
const { createProfileRepository } = require('../src/domain/profile/profileRepository');
const { assessBmi } = require('../src/domain/imc/assessment');

const now = new Date('2026-10-17T16:00:00');
const seed = () => createProfileData('2026-10-17');

test('curtidas, salvos e edições próprias alimentam as coleções de Perfil sem alterar terceiros', () => {
  let data = seed();
  data = togglePost(data, 'likedPostIds', 'post-nutrition-1');
  data = togglePost(data, 'savedPostIds', 'post-nutrition-1');
  data = updateOwnPost(data, demoUser.id, 'post-ana-1', '  Minha evolução.  ');
  data = updateOwnPost(data, demoUser.id, 'post-nutrition-1', 'Não permitido');
  const collections = profileCollections(data, demoUser.id);
  assert.deepEqual(collections.posts.map(post => post.text), ['Minha evolução.']);
  assert.equal(collections.saved[0].authorName, 'Dra. Juliana');
  assert.equal(collections.liked[0].id, 'post-nutrition-1');
  assert.notEqual(collections.liked[0].text, 'Não permitido');
  assert.equal(updateOwnPost(data, demoUser.id, 'post-ana-1', '  '), data);
  assert.equal(togglePost(data, 'likedPostIds', 'inexistente'), data);
  assert.equal(togglePost(data, 'posts', 'post-ana-1'), data);
  data = togglePost(data, 'likedPostIds', 'post-nutrition-1');
  data = togglePost(data, 'savedPostIds', 'post-nutrition-1');
  assert.equal(profileCollections(data, demoUser.id).liked.length, 0);
  assert.equal(profileCollections(data, demoUser.id).saved.length, 0);
});

test('histórico recebe resultados classificados e para revisão, mas ignora avaliações inválidas ou não suportadas', () => {
  let data = seed();
  const adult = assessBmi({ birthDate: '17/10/1996', sex: 'female', weight: '70', height: '175' }, '2026-10-17');
  data = recordBmi(data, demoUser.id, adult, now);
  data = recordBmi(data, demoUser.id, { ...adult, status: 'review', classification: null, message: 'Confira as medidas.' }, now);
  assert.equal(data.bmiHistory.length, 2);
  assert.notEqual(data.bmiHistory[0].id, data.bmiHistory[1].id);
  assert.equal(data.bmiHistory[0].classification, null);
  assert.equal(data.bmiHistory[1].weightKg, 70);
  assert.equal(data.bmiHistory[1].heightMeters, 1.75);
  assert.equal(profileCollections(data, 'outro-usuario').bmi.length, 0);
  for (const status of ['invalid', 'unsupported']) assert.equal(recordBmi(data, demoUser.id, { ...adult, status }, now), data);
});

test('consulta só entra no histórico após confirmação do proprietário e término do horário, sem duplicar', () => {
  let data = seed();
  assert.equal(profileCollections(data, demoUser.id).appointments.length, 0);
  assert.equal(canCompleteAppointment(data.appointments[0], demoUser.id, new Date('2026-10-17T09:29:59')), false);
  assert.equal(canCompleteAppointment(data.appointments[0], demoUser.id, new Date('2026-10-17T09:30:00')), true);
  assert.equal(completeAppointment(data, 'outro-usuario', 'appointment-1', now), data);
  assert.equal(completeAppointment(data, demoUser.id, 'appointment-1', new Date('2026-10-16T16:00:00')), data);
  data = completeAppointment(data, demoUser.id, 'appointment-1', now);
  assert.equal(profileCollections(data, demoUser.id).appointments.length, 1);
  assert.equal(profileCollections(data, 'outro-usuario').appointments.length, 0);
  assert.equal(completeAppointment(data, demoUser.id, 'appointment-1', now), data);
  assert.equal(completeAppointment(data, demoUser.id, 'inexistente', now), data);
});

test('formulário de senha verifica obrigatoriedade, tamanho, repetição e confirmação', () => {
  const valid = { currentPassword: 'senha-atual', newPassword: 'senha-nova', confirmation: 'senha-nova' };
  assert.match(validatePasswordForm({ ...valid, currentPassword: '' }), /senha atual/);
  assert.match(validatePasswordForm({ ...valid, newPassword: 'curta' }), /8 caracteres/);
  assert.match(validatePasswordForm({ ...valid, newPassword: 'senha-atual' }), /diferente/);
  assert.match(validatePasswordForm({ ...valid, confirmation: 'outra-senha' }), /confirmação/);
  assert.equal(validatePasswordForm(valid), null);
});

function memoryStorage() {
  const records = new Map();
  return { records, async getItem(key) { return records.get(key) ?? null; }, async setItem(key, value) { records.set(key, value); } };
}

test('reabrir o repositório mantém históricos, alterações e datas originais; chaves separam usuários', async () => {
  const storage = memoryStorage();
  let data = seed();
  data = togglePost(data, 'savedPostIds', 'post-nutrition-1');
  data = togglePost(data, 'likedPostIds', 'post-nutrition-1');
  data = updateOwnPost(data, demoUser.id, 'post-ana-1', 'Edição persistida');
  data = completeAppointment(data, demoUser.id, 'appointment-1', now);
  const adult = assessBmi({ birthDate: '17/10/1996', sex: 'female', weight: '70', height: '175' }, '2026-10-17');
  data = recordBmi(data, demoUser.id, adult, now);
  await createProfileRepository(storage, demoUser.id).save(data);
  const reloaded = await createProfileRepository(storage, demoUser.id).load();
  assert.deepEqual(reloaded, JSON.parse(JSON.stringify(data)));
  assert.equal(reloaded.appointments[0].date, '2026-10-17');
  const anotherUser = await createProfileRepository(storage, 'patient-other').load();
  assert.deepEqual(anotherUser.savedPostIds, []);
  assert.equal(anotherUser.bmiHistory.length, 0);
  assert.equal(/password|senha/i.test([...storage.records.values()].join('')), false);
});

test('gravações são serializadas e uma falha pode ser recuperada na próxima tentativa', async () => {
  const storage = memoryStorage();
  const originalWrite = storage.setItem;
  let firstRelease;
  let writes = 0;
  storage.setItem = async (key, value) => {
    writes++;
    if (writes === 1) await new Promise(resolve => { firstRelease = resolve; });
    return originalWrite(key, value);
  };
  const repository = createProfileRepository(storage, demoUser.id);
  const first = repository.save(seed());
  const secondData = togglePost(seed(), 'likedPostIds', 'post-nutrition-1');
  const second = repository.save(secondData);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(writes, 1);
  firstRelease();
  await Promise.all([first, second]);
  assert.deepEqual((await repository.load()).likedPostIds, ['post-nutrition-1']);
  storage.setItem = async () => { throw new Error('Sem espaço'); };
  await assert.rejects(repository.save(seed()), /Sem espaço/);
  storage.setItem = originalWrite;
  await repository.save(secondData);
  assert.deepEqual((await repository.load()).likedPostIds, ['post-nutrition-1']);
});

test('falhas na leitura ou dados corrompidos são expostos sem sobrescrever o histórico', async () => {
  let writes = 0;
  for (const raw of ['{', '{}', 'null']) {
    const repository = createProfileRepository({ async getItem() { return raw; }, async setItem() { writes++; } }, demoUser.id);
    await assert.rejects(repository.load());
  }
  const unavailable = createProfileRepository({ async getItem() { throw new Error('Leitura indisponível'); } }, demoUser.id);
  await assert.rejects(unavailable.load(), /Leitura indisponível/);
  assert.equal(writes, 0);
});
