const PROFESSIONAL_ROLES = new Set(['doctor', 'nutritionist', 'psychologist', 'pilates_teacher']);

function editMode(actor, post) {
  if (!actor || !post) return 'none';
  if (actor.id === post.authorId) return 'direct';
  if (!PROFESSIONAL_ROLES.has(actor.role)) return 'none';
  return 'request';
}

function canEditPost(actor, post) {
  return editMode(actor, post) === 'direct';
}

function canRequestPostEdit(actor, post) {
  return editMode(actor, post) === 'request';
}

function canViewEditRequest(viewer, request) {
  if (!viewer || !request) return false;
  return viewer.id === request.requesterId || viewer.id === request.postAuthorId;
}

module.exports = { PROFESSIONAL_ROLES, editMode, canEditPost, canRequestPostEdit, canViewEditRequest };
