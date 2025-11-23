import React, { useState, useEffect } from 'react';
import { medicos } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card, botao } = estilos;

export default function HistoricoPacienteMedico({ pacienteSelecionado, onVoltar, onMensagem }) {
  const [historicoPaciente, setHistoricoPaciente] = useState([]);

  useEffect(() => {
    if (pacienteSelecionado) {
      carregarHistorico();
    }
  }, [pacienteSelecionado]);

  async function carregarHistorico() {
    try {
      const dados = await medicos.buscarHistoricoPaciente(pacienteSelecionado.paciente_id);
      setHistoricoPaciente(dados);
    } catch (err) {
      onMensagem('Erro ao carregar histórico.', 'erro');
    }
  }

  if (!pacienteSelecionado) {
    return <div style={card}><p>Nenhum paciente selecionado.</p></div>;
  }

  return (
    <div style={card}>
      <h3>Histórico do Paciente</h3>
      <div style={{ marginBottom: '16px' }}>
        <strong>Nome:</strong> {pacienteSelecionado.paciente_nome} {pacienteSelecionado.paciente_sobrenome}<br />
        <strong>Telefone:</strong> {pacienteSelecionado.paciente_telefone || 'Não informado'}<br />
        <strong>Email:</strong> {pacienteSelecionado.paciente_email}<br />
        <strong>Convênio:</strong> {pacienteSelecionado.possui_convenio ? `${pacienteSelecionado.convenio_nome} - ${pacienteSelecionado.numero_convenio}` : 'Particular'}
      </div>

      <h4>Histórico de Consultas</h4>
      {historicoPaciente.length === 0 && <p>Nenhuma consulta registrada.</p>}
      {historicoPaciente.map((h) => (
        <div key={h.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
          <div><strong>Data/Hora:</strong> {formatarDataHora(h.data_hora)}</div>
          <div><strong>Médico:</strong> {h.medico_nome} ({h.especialidade})</div>
          <div><strong>Status:</strong> {h.status}</div>
          {h.observacoes && <div><strong>Observações:</strong> {h.observacoes}</div>}
        </div>
      ))}

      <button style={{ ...botao, backgroundColor: '#6c757d', marginTop: '16px' }} onClick={onVoltar}>
        Voltar
      </button>
    </div>
  );
}
