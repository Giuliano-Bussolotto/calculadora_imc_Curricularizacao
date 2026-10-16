const roles = [
  {
    id: 'admin',
    name: 'Administrador (ADM)',
    description: 'Titular autorizado a criar Supervisores/Diretores e atribuir o cargo de ADM.',
    status: 'active',
  },
  {
    id: 'supervisor',
    name: 'Supervisor/Diretor',
    description: 'Gestão operacional, sem acesso a dados pessoais de terceiros nem atribuição de ADM.',
    status: 'active',
  },
  {
    id: 'doctor',
    name: 'Médico',
    description: 'Atendimento clínico e conteúdo profissional.',
    status: 'active',
  },
  {
    id: 'nutritionist',
    name: 'Nutricionista',
    description: 'Nutrição, agenda pessoal e conteúdo profissional.',
    status: 'active',
  },
  {
    id: 'pilates_teacher',
    name: 'Professora de Pilates',
    description: 'Pilates, agenda pessoal e conteúdo profissional.',
    status: 'active',
  },
  {
    id: 'psychologist',
    name: 'Psicóloga',
    description: 'Solicitações de edição e menções recebidas.',
    status: 'active',
  },
  {
    id: 'patient',
    name: 'Paciente',
    description: 'Recursos pessoais de saúde e bem-estar.',
    status: 'active',
  },
  {
    id: 'public',
    name: 'Usuário público',
    description: 'Feed público e calculadora de IMC.',
    status: 'active',
  },
];

function getRole(roleId) {
  return roles.find(role => role.id === roleId) || null;
}

module.exports = { roles, getRole };
