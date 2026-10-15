const PROFESSIONAL_ROLES = new Set(['doctor', 'nutritionist', 'psychologist', 'pilates_teacher']);

function editMode(actor, post) {
  if (!actor || !post) return 'none';
  if (actor.id === post.authorId) return 'direct';
  if (!PROFESSIONAL_ROLES.has(actor.role)) return 'none';
  if ((post.mentionedUserIds || []).includes(actor.id)) return 'direct';
  return 'request';
}

function canEditPost(actor, post) {
  return editMode(actor, post) === 'direct';
}

function canRequestPostEdit(actor, post) {
  return editMode(actor, post) === 'request';
}

module.exports = { PROFESSIONAL_ROLES, editMode, canEditPost, canRequestPostEdit };
