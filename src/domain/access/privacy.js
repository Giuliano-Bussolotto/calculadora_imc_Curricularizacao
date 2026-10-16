const ADMIN_ROLES = new Set(['admin']);
const PROTECTED_RESOURCES = new Set([
  'schedule', 'appointment', 'notification', 'access', 'like', 'history', 'personal_data',
]);

function isAdministrator(user) {
  return Boolean(user && ADMIN_ROLES.has(user.role));
}

function canViewOwnedResource(viewer, resource) {
  if (!viewer || !resource || !PROTECTED_RESOURCES.has(resource.type)) return false;
  return isAdministrator(viewer) || resource.ownerId === viewer.id;
}

function visibleOwnedResources(viewer, resources = []) {
  return resources.filter(resource => canViewOwnedResource(viewer, resource));
}

module.exports = { ADMIN_ROLES, PROTECTED_RESOURCES, isAdministrator, canViewOwnedResource, visibleOwnedResources };
