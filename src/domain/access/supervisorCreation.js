const CURRENT_SUPERVISOR_CREATORS = [
  { id: 'admin-giuliano', name: 'Giuliano' },
];

const allowedCreatorIds = new Set(CURRENT_SUPERVISOR_CREATORS.map(user => user.id));

function canCreateSupervisor(user) {
  return Boolean(user && user.role === 'admin' && allowedCreatorIds.has(user.id));
}

module.exports = { CURRENT_SUPERVISOR_CREATORS, canCreateSupervisor };
