import React, { useState, useEffect } from 'react';
import { admin, consultas, medicos, usuarios, bloqueios } from '../../services/api';
import { estilos } from '../../utils/formatters';

const { card } = estilos;

export default function DashboardAdmin({ onMensagem }) {
  const [todasConsultas, setTodasConsultas] = useState([]);
  const [listaMedicos, setListaMedicos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [listaBloqueios, setListaBloqueios] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [consultasData, medicosData, usuariosData, bloqueiosData] = await Promise.all([
        consultas.listar(),
        medicos.listar(),
        usuarios.listar(),
        bloqueios.listar(),
      ]);

      setTodasConsultas(consultasData);
      setListaMedicos(medicosData);
      setListaUsuarios(usuariosData);
      setListaBloqueios(bloqueiosData);
    } catch (err) {
      onMensagem('Erro ao carregar dashboard.', 'erro');
    }
  }

  const totalConsultas = todasConsultas.length;
  const agendadas = todasConsultas.filter(c => c.status === 'AGENDADA').length;
  const confirmadas = todasConsultas.filter(c => c.status === 'CONFIRMADA').length;
  const realizadas = todasConsultas.filter(c => c.status === 'REALIZADA').length;
  const canceladas = todasConsultas.filter(c => c.status === 'CANCELADA').length;

  const hoje = new Date().toISOString().split('T')[0];
  const consultasHoje = todasConsultas.filter(c => c.data_hora.startsWith(hoje));

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Dashboard Administrativo</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ ...card, backgroundColor: '#3498db', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalConsultas}</div>
          <div>Total de Consultas</div>
        </div>

        <div style={{ ...card, backgroundColor: '#f39c12', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{agendadas}</div>
          <div>Agendadas</div>
        </div>

        <div style={{ ...card, backgroundColor: '#3498db', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{confirmadas}</div>
          <div>Confirmadas</div>
        </div>

        <div style={{ ...card, backgroundColor: '#27ae60', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{realizadas}</div>
          <div>Realizadas</div>
        </div>

        <div style={{ ...card, backgroundColor: '#e74c3c', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{canceladas}</div>
          <div>Canceladas</div>
        </div>

        <div style={{ ...card, backgroundColor: '#9b59b6', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{listaMedicos.length}</div>
          <div>Médicos Ativos</div>
        </div>

        <div style={{ ...card, backgroundColor: '#16a085', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{listaUsuarios.filter(u => u.tipo === 'PACIENTE').length}</div>
          <div>Pacientes</div>
        </div>

        <div style={{ ...card, backgroundColor: '#e67e22', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{listaBloqueios.length}</div>
          <div>Bloqueios Ativos</div>
        </div>
      </div>

      <div style={card}>
        <h4>Consultas Hoje</h4>
        {consultasHoje.length === 0 ? (
          <p>Nenhuma consulta agendada para hoje.</p>
        ) : (
          consultasHoje.map(c => (
            <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>{c.data_hora.substring(11, 16)}</strong> - {c.paciente_nome} com Dr(a). {c.medico_nome} - {c.status}
            </div>
          ))
        )}
      </div>

      <div style={card}>
        <h4>Médicos Mais Ocupados</h4>
        {(() => {
          const medicosComConsultas = listaMedicos.map(m => ({
            ...m,
            totalConsultas: todasConsultas.filter(c => c.medico_nome === m.nome && c.medico_sobrenome === m.sobrenome).length
          })).sort((a, b) => b.totalConsultas - a.totalConsultas).slice(0, 5);

          return medicosComConsultas.map(m => (
            <div key={m.id} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>Dr(a). {m.nome} {m.sobrenome}</strong> - {m.especialidade}: {m.totalConsultas} consultas
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
