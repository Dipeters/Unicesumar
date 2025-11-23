import React, { useState, useEffect } from 'react';
import { admin, consultas } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function GerenciarConsultas({ onMensagem, onNavigate }) {
  const [todasConsultas, setTodasConsultas] = useState([]);
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    carregarConsultas();
  }, []);

  async function carregarConsultas() {
    try {
      const dados = await consultas.listar();
      setTodasConsultas(dados);
    } catch (err) {
      onMensagem('Erro ao carregar consultas.', 'erro');
    }
  }

  async function atualizarStatusConsulta(id, novoStatus, observacoes = '') {
    try {
      await consultas.atualizar(id, { status: novoStatus, observacoes });
      onMensagem('Status atualizado com sucesso!');
      carregarConsultas();
    } catch (err) {
      onMensagem(err.message || 'Erro ao atualizar status.', 'erro');
    }
  }

  const consultasFiltradas = todasConsultas.filter((c) => {
    let passa = true;

    if (
      filtroMedico &&
      !`${c.medico_nome} ${c.medico_sobrenome}`.toLowerCase().includes(filtroMedico.toLowerCase())
    )
      passa = false;

    if (filtroData && !c.data_hora.startsWith(filtroData)) passa = false;
    if (filtroStatus && c.status !== filtroStatus) passa = false;

    return passa;
  });

  return (
    <div style={card}>
      <h3>Gerenciar Todas as Consultas</h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <label style={label}>Filtrar por Médico</label>
          <input
            style={input}
            type="text"
            placeholder="Nome do médico..."
            value={filtroMedico}
            onChange={(e) => setFiltroMedico(e.target.value)}
          />
        </div>

        <div>
          <label style={label}>Filtrar por Data</label>
          <input
            style={input}
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>

        <div>
          <label style={label}>Filtrar por Status</label>
          <select style={input} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="AGENDADA">Agendada</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="REALIZADA">Realizada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Mostrando:</strong> {consultasFiltradas.length} de {todasConsultas.length} consultas
        {(filtroMedico || filtroData || filtroStatus) && (
          <button
            style={{ ...botao, marginLeft: '12px', fontSize: '12px', padding: '4px 8px' }}
            onClick={() => {
              setFiltroMedico('');
              setFiltroData('');
              setFiltroStatus('');
            }}
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {consultasFiltradas.length === 0 ? (
        <p>Nenhuma consulta encontrada com os filtros aplicados.</p>
      ) : (
        consultasFiltradas.map((c) => {
          const isPast = new Date(c.data_hora) < new Date();
          const statusColor =
            c.status === 'REALIZADA'
              ? '#28a745'
              : c.status === 'CANCELADA'
              ? '#dc3545'
              : c.status === 'CONFIRMADA'
              ? '#007bff'
              : '#ffc107';

          return (
            <div
              key={c.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px',
                backgroundColor: isPast ? '#f8f9fa' : '#fff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: statusColor,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {c.status}
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>ID: {c.id}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <strong>Paciente:</strong> {c.paciente_nome} {c.paciente_sobrenome}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    📧 {c.paciente_email}
                    <br />
                    📞 {c.paciente_telefone || 'Não informado'}
                  </div>
                </div>

                <div>
                  <strong>Médico:</strong> {c.medico_nome} {c.medico_sobrenome}
                  <div style={{ fontSize: '12px', color: '#666' }}>🩺 {c.especialidade}</div>
                </div>
              </div>

              <div>
                <strong>Data/Hora:</strong> {formatarDataHora(c.data_hora)}
              </div>

              {c.observacoes && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                >
                  <strong>Observações:</strong> {c.observacoes}
                </div>
              )}

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  style={{ ...botao, fontSize: '12px', padding: '6px 10px' }}
                  onClick={() => atualizarStatusConsulta(c.id, 'CONFIRMADA')}
                  disabled={c.status === 'REALIZADA' || c.status === 'CANCELADA'}
                >
                  Confirmar
                </button>

                <button
                  style={{
                    ...botao,
                    backgroundColor: '#ffc107',
                    fontSize: '12px',
                    padding: '6px 10px',
                  }}
                  onClick={() => {
                    const obs = prompt('Motivo do cancelamento:');
                    if (obs) atualizarStatusConsulta(c.id, 'CANCELADA', obs);
                  }}
                  disabled={c.status === 'REALIZADA' || c.status === 'CANCELADA'}
                >
                  Cancelar
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
