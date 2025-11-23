// src/services/api.js
// URL base da API (backend em Node.js/Express)
export const API_URL = 'http://localhost:3001';

// Função auxiliar para fazer requisições
async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// ======================
// AUTENTICAÇÃO
// ======================
export const auth = {
  login: (email, senha) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  registrar: (dados) =>
    request('/api/auth/registrar', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
};

// ======================
// MÉDICOS
// ======================
export const medicos = {
  // lista todos os médicos
  listar: () => request('/api/medicos'),

  // usado só se quiser cadastrar médico fora do admin
  cadastrar: (dados) =>
    request('/api/admin/medicos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  // usado em HistoricoPacienteMedico.jsx
  buscarHistoricoPaciente: (pacienteId) =>
    request(`/api/medico/historico-paciente/${pacienteId}`),
};

// ======================
// CONSULTAS
// ======================
export const consultas = {
  // usado no DashboardAdmin e GerenciarConsultas
  listar: () => request('/api/admin/consultas'),

  listarPorPaciente: (pacienteId) =>
    request(`/api/consultas/paciente/${pacienteId}`),

  listarPorMedico: (medicoId) =>
    request(`/api/consultas/medico/${medicoId}`),

  // agendar nova consulta (Paciente)
  agendar: (dados) =>
    request('/api/consultas', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  // atualizar status (CONFIRMADA, CANCELADA, REALIZADA)
  atualizar: (id, { status, observacoes }) =>
    request(`/api/consultas/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, observacoes }),
    }),

  // para usar se implementar reagendamento
  reagendar: (id, novaDataHora) =>
    request(`/api/consultas/${id}/reagendar`, {
      method: 'PUT',
      body: JSON.stringify({ novaDataHora }),
    }),
};

// ======================
// HORÁRIOS (PACIENTE)
// ======================
// Aqui usamos a rota /api/consultas/ocupadas/:medicoId/:dia
// e calculamos os horários LIVRES no frontend
export const horarios = {
  disponiveis: async (medicoId, data) => {
    // data no formato YYYY-MM-DD
    const ocupados = await request(
      `/api/consultas/ocupadas/${medicoId}/${data}`
    ); // backend retorna array de "HH:MM"

    const todosHorarios = [
      '08:00','08:15','08:30','08:45',
      '09:00','09:15','09:30','09:45',
      '10:00','10:15','10:30','10:45',
      '11:00','11:15','11:30','11:45',
      '12:00','12:15','12:30','12:45',
      '13:00','13:15','13:30','13:45',
      '14:00','14:15','14:30','14:45',
      '15:00','15:15','15:30','15:45',
      '16:00','16:15','16:30','16:45',
      '17:00','17:15','17:30','17:45',
    ];

    const livres = todosHorarios.filter((h) => !ocupados.includes(h));

    // PainelPaciente espera um objeto { horarios: [...] }
    return { horarios: livres };
  },
};

// ======================
// BLOQUEIOS
// ======================
// Mistura coisas de Admin (clínica) e Médico (agenda própria)
export const bloqueios = {
  // usado em DashboardAdmin para cards e na tela de BloqueiosAdmin
  listar: () => request('/api/admin/bloqueios'),

  // usado em BloquearAgendaMedico.jsx
  // lá ele manda: { medico_id, dataInicio, dataFim, motivo, turno, diasSemana }
  criar: (dados) =>
    request('/api/medico/bloquear-agenda', {
      method: 'POST',
      body: JSON.stringify({
        medicoId: dados.medico_id,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        motivo: dados.motivo,
        turno: dados.turno || null,
        diasSemana: dados.diasSemana || null,
      }),
    }),
};

// ======================
// USUÁRIOS (PACIENTE)
// ======================
export const usuarios = {
  // lista geral de usuários (para Admin, se quiser usar)
  listar: () => request('/api/admin/usuarios'),

  // usado em PerfilPaciente.jsx
  atualizarPerfil: (id, dados) =>
    request(`/api/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  // usado em PerfilPaciente.jsx
  alterarSenha: (id, senhaAtual, novaSenha) =>
    request(`/api/pacientes/${id}/senha`, {
      method: 'PUT',
      body: JSON.stringify({ senhaAtual, novaSenha }),
    }),
};

// ======================
// FUNÇÕES ADMIN
// ======================
// Usadas em CadastrarMedico, UsuariosAdmin, BloqueiosAdmin
export const admin = {
  // usado antes em DashboardAdmin / GerenciarConsultas (mantido por compatibilidade)
  listarTodasConsultas: () => request('/api/admin/consultas'),

  // CadastrarMedico.jsx
  listarMedicos: () => request('/api/medicos'),
  criarMedico: (dados) =>
    request('/api/admin/medicos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  // UsuariosAdmin.jsx
  listarUsuarios: () => request('/api/admin/usuarios'),
  removerUsuario: (id) =>
    request(`/api/admin/usuario/${id}`, {
      method: 'DELETE',
    }),
  resetarSenha: (id, novaSenha) =>
    request(`/api/admin/reset-senha/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ novaSenha }),
    }),

  // BloqueiosAdmin.jsx
  listarBloqueios: () => request('/api/admin/bloqueios'),
  criarBloqueio: (dados) =>
    request('/api/admin/bloquear-clinica', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
  removerBloqueio: (id) =>
    request(`/api/admin/bloqueio/${id}`, {
      method: 'DELETE',
    }),
};