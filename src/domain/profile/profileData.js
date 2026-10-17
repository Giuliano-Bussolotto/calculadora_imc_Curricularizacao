const { parseDateOnly, todayDateOnly } = require('../imc/age');

// Identidade e conteúdo de exemplo enquanto o acesso não possui autenticação.
const demoUser = { id: 'patient-ana', role: 'patient', name: 'Ana', photoUri: null };

function createProfileData(today = todayDateOnly()) {
  return {
    posts: [
      { id: 'post-nutrition-1', authorId: 'nutritionist-juliana', authorName: 'Dra. Juliana', text: 'Uma alimentação equilibrada é a base para mais energia e qualidade de vida. 💙' },
      { id: 'post-pilates-1', authorId: 'pilates-team', authorName: 'Equipe de Pilates', text: 'Movimento consciente também é uma forma de autocuidado.' },
      { id: 'post-ana-1', authorId: demoUser.id, authorName: demoUser.name, text: 'Hoje completei minha caminhada e cuidei um pouco mais de mim.' },
    ],
    likedPostIds: [],
    savedPostIds: [],
    bmiHistory: [],
    appointments: [
      { id: 'appointment-1', ownerId: demoUser.id, type: 'appointment', date: today, specialty: 'Nutrição', professional: 'Dra. Juliana', time: '09:00 – 09:30', endsAt: '09:30', icon: 'nutrition' },
      { id: 'appointment-2', ownerId: demoUser.id, type: 'appointment', date: today, specialty: 'Pilates', professional: 'Prof. Ana', time: '10:00 – 11:00', endsAt: '11:00', icon: 'activity' },
      { id: 'appointment-3', ownerId: demoUser.id, type: 'appointment', date: today, specialty: 'Psicologia', professional: 'Dra. Carla', time: '14:00 – 15:00', endsAt: '15:00', icon: 'profile' },
    ],
  };
}

function togglePost(data, collection, postId) {
  if (!['likedPostIds', 'savedPostIds'].includes(collection) || !data.posts.some(post => post.id === postId)) return data;
  const ids = data[collection];
  return { ...data, [collection]: ids.includes(postId) ? ids.filter(id => id !== postId) : [...ids, postId] };
}

function updateOwnPost(data, userId, postId, text) {
  if (!text.trim()) return data;
  return { ...data, posts: data.posts.map(post => post.id === postId && post.authorId === userId ? { ...post, text: text.trim() } : post) };
}

function recordBmi(data, userId, evaluation, now = new Date()) {
  if (!['classified', 'review'].includes(evaluation.status) || !Number.isFinite(evaluation.bmi)) return data;
  const entry = {
    id: `${now.getTime()}-${data.bmiHistory.length}`, ownerId: userId, recordedAt: now.toISOString(),
    bmi: evaluation.bmi, weightKg: evaluation.weightKg, heightMeters: evaluation.heightMeters,
    classification: evaluation.classification, protocol: evaluation.protocol, message: evaluation.message,
  };
  return { ...data, bmiHistory: [entry, ...data.bmiHistory] };
}

function canCompleteAppointment(appointment, userId, now = new Date()) {
  if (!appointment || appointment.ownerId !== userId || appointment.completedAt || !parseDateOnly(appointment.date)) return false;
  if (!/^\d{2}:\d{2}$/.test(appointment.endsAt || '')) return false;
  const end = new Date(`${appointment.date}T${appointment.endsAt}:00`);
  return Number.isFinite(end.getTime()) && end <= now;
}

function completeAppointment(data, userId, appointmentId, now = new Date()) {
  const appointment = data.appointments.find(item => item.id === appointmentId);
  if (!canCompleteAppointment(appointment, userId, now)) return data;
  return { ...data, appointments: data.appointments.map(item => item.id === appointmentId ? { ...item, completedAt: now.toISOString() } : item) };
}

function profileCollections(data, userId) {
  return {
    posts: data.posts.filter(post => post.authorId === userId),
    saved: data.posts.filter(post => data.savedPostIds.includes(post.id)),
    liked: data.posts.filter(post => data.likedPostIds.includes(post.id)),
    bmi: data.bmiHistory.filter(entry => entry.ownerId === userId),
    appointments: data.appointments.filter(item => item.ownerId === userId && item.completedAt).sort((a, b) => b.date.localeCompare(a.date)),
  };
}

function validatePasswordForm({ currentPassword, newPassword, confirmation }) {
  if (!currentPassword) return 'Informe sua senha atual.';
  if (newPassword.length < 8 || !newPassword.trim()) return 'A nova senha deve ter pelo menos 8 caracteres.';
  if (newPassword === currentPassword) return 'A nova senha deve ser diferente da senha atual.';
  if (newPassword !== confirmation) return 'A confirmação não corresponde à nova senha.';
  return null;
}

module.exports = { demoUser, createProfileData, togglePost, updateOwnPost, recordBmi, canCompleteAppointment, completeAppointment, profileCollections, validatePasswordForm };
