const rolePermissions = {
  psychologist: {
    modules: ['edit_requests', 'mentions'],
    canViewOtherUsers: false,
    canViewOtherSchedules: false,
    canViewAccesses: false,
    canViewLikes: false,
    canViewHistories: false,
    canViewPersonalData: false,
  },
};

const moduleLabels = {
  edit_requests: 'Solicitações de edição',
  mentions: 'Menções recebidas',
};

function permissionsFor(roleId) {
  return rolePermissions[roleId] || { modules: [] };
}

function canAccessModule(roleId, moduleId) {
  return permissionsFor(roleId).modules.includes(moduleId);
}

module.exports = { rolePermissions, moduleLabels, permissionsFor, canAccessModule };
