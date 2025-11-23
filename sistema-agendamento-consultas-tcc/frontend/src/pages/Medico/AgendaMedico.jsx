import React, { useState, useEffect } from 'react';
import { consultas } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card } = estilos;

export default function AgendaMedico({ usuario, onMensagem }) {
  const [consultasMedico, setConsultasMedico] = useState([]);

  useEffect(() => {
    carregarConsultas();
  }, [usuario.id]);

  async function carregarConsultas() {
    try {
      const dados = await consultas.listarPorMedico(usuario.id);
      setConsultasMedico(dados);
    } catch (err) {
      onMensagem('Erro ao carregar agenda.', 'erro');
    }
  }

  const hoje = new Date().toISOString().split('T')[0];
  const consultasHoje = consultasMedico.filter((c) => c.data_hora.startsWith(hoje));
  const consultasFuturas = consultasMedico.filter((c) => new Date(c.data_hora) > new Date());

  return (
    <div>
      <div style={card}>
        <h3>Minha Agenda</h3>

        <h4>📅 Consultas de Hoje ({consultasHoje.length})</h4>
        {consultasHoje.length === 0 ? (
          <p>Nenhuma consulta agendada para hoje.</p>
        ) : (
          consultasHoje.map((c) => (
            <div key={c.id} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '8px', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
              <div><strong>{c.data_hora.substring(11, 16)}</strong> - {c.paciente_nome} {c.paciente_sobrenome}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Status: {c.status}</div>
            </div>
          ))
        )}

        <h4 style={{ marginTop: '24px' }}>📆 Próximas Consultas ({consultasFuturas.length})</h4>
        {consultasFuturas.slice(0, 10).map((c) => {
          const data = new Date(c.data_hora);
          const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][data.getDay()];

          return (
            <div key={c.id} style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '8px', borderRadius: '8px' }}>
              <div><strong>{diaSemana}, {formatarDataHora(c.data_hora)}</strong></div>
              <div>{c.paciente_nome} {c.paciente_sobrenome}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Status: {c.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
