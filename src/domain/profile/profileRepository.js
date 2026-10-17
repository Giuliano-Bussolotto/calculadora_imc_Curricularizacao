const { createProfileData } = require('./profileData');

function createProfileRepository(storage, userId) {
  const key = `@imc/profile/v1/${userId}`;
  let pending = Promise.resolve();
  return {
    async load() {
      const raw = await storage.getItem(key);
      if (raw === null) return createProfileData();
      const data = JSON.parse(raw);
      if (!data || !['posts', 'likedPostIds', 'savedPostIds', 'bmiHistory', 'appointments'].every(field => Array.isArray(data[field]))) {
        throw new Error('Dados de perfil inválidos.');
      }
      return data;
    },
    save(data) {
      const snapshot = JSON.stringify(data);
      // Serializa gravações para uma interação antiga não sobrescrever a mais recente.
      const result = pending.catch(() => {}).then(() => storage.setItem(key, snapshot));
      pending = result;
      return result;
    },
  };
}

module.exports = { createProfileRepository };
