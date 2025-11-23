import React, { useState, useEffect } from 'react';
import { consultas } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card } = estilos;

export default function HistoricoPaciente({ usuario, onMensagem }) {
  const [consultasPaciente, setConsultasPaciente] = useState([]);

  useEffect(() => {
    carregarHistorico();
  }, [usuario.id]);

  async function carregarHistorico() {
    try {
      const dados = await consultas.listarPorPaciente(usuario.id);
      setConsultasPaciente(dados);
    } catch (err) {
      onMensagem('Erro ao carregar histórico.', 'erro');
    }
  }

  return (
    <div style={card}>
      <h3>Histórico Completo de Consultas</h3>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        Visualize todas as suas consultas: agendadas, realizadas e canceladas
      </p>

      {consultasPaciente.length === 0 && <p>Você ainda não possui consultas registradas.</p>}

      {consultasPaciente.length > 0 && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <strong>Total de consultas:</strong> {consultasPaciente.length}
          </div>

          {consultasPaciente.map((c) => {
            const isPast = new Date(c.data_hora) < new Date();
            const statusColor =
              c.status === 'REALIZADA' ? '#28a745' :
              c.status === 'CANCELADA' ? '#dc3545' :
              c.status === 'CONFIRMADA' ? '#007bff' : '#ffc107';

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: statusColor, color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                    {c.status}
                  </div>
                  {isPast && <span style={{ fontSize: '12px', color: '#666' }}>📅 Consulta passada</span>}
                </div>

                <div><strong>Médico:</strong> {c.medico_nome} {c.medico_sobrenome}</div>
                <div><strong>Especialidade:</strong> {c.especialidade}</div>
                <div><strong>Data/Hora:</strong> {formatarDataHora(c.data_hora)}</div>
                {c.observacoes && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <strong>Observações:</strong> {c.observacoes}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
