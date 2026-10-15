const CURRENT_SUPERVISOR_CREATORS = [
  { id: 'supervisor-yenny', name: 'Yenny' },
  { id: 'supervisor-yohgenson', name: 'Yohgenson' },
];

const allowedCreatorIds = new Set(CURRENT_SUPERVISOR_CREATORS.map(user => user.id));

function canCreateSupervisor(user) {
  return Boolean(user && user.role === 'supervisor' && allowedCreatorIds.has(user.id));
}

module.exports = { CURRENT_SUPERVISOR_CREATORS, canCreateSupervisor };
