const CURRENT_ADMIN_AUTHORIZERS = [
  { id: 'admin-giuliano', name: 'Giuliano' },
];

const allowedAuthorizerIds = new Set(CURRENT_ADMIN_AUTHORIZERS.map(user => user.id));

function isCurrentAdmin(user) {
  return Boolean(user && user.role === 'admin' && allowedAuthorizerIds.has(user.id));
}

function canCreateSupervisor(user) {
  return isCurrentAdmin(user);
}

function canAssignAdmin(user) {
  return isCurrentAdmin(user);
}

module.exports = { CURRENT_ADMIN_AUTHORIZERS, canCreateSupervisor, canAssignAdmin };
