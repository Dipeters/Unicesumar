import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { estilos } from '../../utils/formatters';

const { card, botao } = estilos;

export default function UsuariosAdmin({ onMensagem }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const dados = await admin.listarUsuarios();
      setUsuarios(dados);
    } catch (err) {
      onMensagem('Erro ao carregar usuários.', 'erro');
    }
  }

  async function removerUsuario(id) {
    if (!window.confirm('Deseja realmente remover este usuário? Esta ação não pode ser desfeita.')) return;
    try {
      await admin.removerUsuario(id);
      onMensagem('Usuário removido com sucesso!');
      carregarUsuarios();
    } catch (err) {
      onMensagem(err.message || 'Erro ao remover usuário.', 'erro');
    }
  }

  async function resetarSenha(id) {
    const novaSenha = prompt('Digite a nova senha para o usuário:');
    if (!novaSenha) return;
    if (novaSenha.length < 6) {
      onMensagem('A senha deve ter no mínimo 6 caracteres.', 'erro');
      return;
    }
    try {
      await admin.resetarSenha(id, novaSenha);
      onMensagem('Senha resetada com sucesso!');
    } catch (err) {
      onMensagem(err.message || 'Erro ao resetar senha.', 'erro');
    }
  }

  const pacientes = usuarios.filter(u => u.tipo === 'PACIENTE');
  const medicos = usuarios.filter(u => u.tipo === 'MEDICO');
  const admins = usuarios.filter(u => u.tipo === 'ADMIN');

  return (
    <div>
      <div style={card}>
        <h3>Gerenciar Usuários</h3>
        <p style={{ color: '#666' }}>
          Total: {usuarios.length} • Pacientes: {pacientes.length} • Médicos: {medicos.length} • Admins: {admins.length}
        </p>
      </div>

      <div style={card}>
        <h4>👥 Pacientes ({pacientes.length})</h4>
        {pacientes.length === 0 && <p>Nenhum paciente cadastrado.</p>}
        {pacientes.map((u) => (
          <div key={u.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>{u.nome} {u.sobrenome}</strong></div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {u.email} • {u.telefone || 'Sem telefone'}
                {u.possui_convenio === 1 && ` • ${u.convenio_nome}`}
              </div>
            </div>
            <div>
              <button style={{ ...botao, fontSize: '12px', padding: '4px 8px' }} onClick={() => resetarSenha(u.id)}>
                Resetar Senha
              </button>
              <button style={{ ...botao, backgroundColor: '#dc3545', fontSize: '12px', padding: '4px 8px', marginLeft: '8px' }} onClick={() => removerUsuario(u.id)}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h4>👨‍⚕️ Médicos ({medicos.length})</h4>
        {medicos.length === 0 && <p>Nenhum médico cadastrado.</p>}
        {medicos.map((u) => (
          <div key={u.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div><strong>Dr(a). {u.nome} {u.sobrenome}</strong></div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {u.especialidade} • {u.email}
              </div>
            </div>
            <div>
              <button style={{ ...botao, fontSize: '12px', padding: '4px 8px' }} onClick={() => resetarSenha(u.id)}>
                Resetar Senha
              </button>
              <button style={{ ...botao, backgroundColor: '#dc3545', fontSize: '12px', padding: '4px 8px', marginLeft: '8px' }} onClick={() => removerUsuario(u.id)}>
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={card}>
        <h4>🔧 Administradores ({admins.length})</h4>
        {admins.length === 0 && <p>Nenhum administrador cadastrado.</p>}
        {admins.map((u) => (
          <div key={u.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div><strong>{u.nome} {u.sobrenome}</strong></div>
            <div style={{ fontSize: '14px', color: '#666' }}>{u.email}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
