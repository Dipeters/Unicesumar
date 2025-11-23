import React, { useState, useEffect } from 'react';
import { consultas } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card, botao } = estilos;

export default function ConsultasMedico({ usuario, onMensagem, onNavigate }) {
  const [consultasMedico, setConsultasMedico] = useState([]);

  useEffect(() => {
    carregarConsultas();
  }, [usuario.id]);

  async function carregarConsultas() {
    try {
      const dados = await consultas.listarPorMedico(usuario.id);
      setConsultasMedico(dados);
    } catch (err) {
      onMensagem('Erro ao carregar consultas.', 'erro');
    }
  }

  async function atualizarStatusConsulta(id, novoStatus, observacoes = '') {
    try {
      await consultas.atualizar(id, { status: novoStatus, observacoes });
      onMensagem(`Consulta ${novoStatus.toLowerCase()} com sucesso!`);
      carregarConsultas();
    } catch (err) {
      onMensagem(err.message || 'Erro ao atualizar consulta.', 'erro');
    }
  }

  function iniciarReagendamento(consulta) {
    if (onNavigate) {
      onNavigate('reagendar', consulta);
    } else {
      onMensagem('Funcionalidade de reagendamento em desenvolvimento.');
    }
  }

  function visualizarHistoricoPaciente(consulta) {
    if (onNavigate) {
      onNavigate('historico-paciente', consulta);
    } else {
      onMensagem('Funcionalidade de histórico em desenvolvimento.');
    }
  }

  return (
    <div>
      <div style={card}>
        <h3>Minhas Consultas</h3>
        <p style={{ color: '#666' }}>Gerencie suas consultas agendadas</p>

        {consultasMedico.length === 0 && <p>Você ainda não possui consultas agendadas.</p>}
        {consultasMedico.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div><strong>Paciente:</strong> {c.paciente_nome} {c.paciente_sobrenome}</div>
            <div><strong>Telefone:</strong> {c.paciente_telefone || 'Não informado'}</div>
            <div><strong>Email:</strong> {c.paciente_email}</div>
            <div><strong>Convênio:</strong> {c.possui_convenio ? `${c.convenio_nome} - ${c.numero_convenio}` : 'Particular'}</div>
            <div><strong>Data/Hora:</strong> {formatarDataHora(c.data_hora)}</div>
            <div><strong>Status atual:</strong> {c.status}</div>
            {c.observacoes && <div><strong>Observações:</strong> {c.observacoes}</div>}

            <div style={{ marginTop: '8px' }}>
              <button style={botao} onClick={() => atualizarStatusConsulta(c.id, 'CONFIRMADA')}>
                Confirmar
              </button>
              <button style={{ ...botao, backgroundColor: '#ffc107' }} onClick={() => {
                const obs = prompt('Observações (opcional):');
                atualizarStatusConsulta(c.id, 'CANCELADA', obs || '');
              }}>
                Cancelar
              </button>
              <button style={{ ...botao, backgroundColor: '#28a745' }} onClick={() => {
                const obs = prompt('Observações da consulta (opcional):');
                atualizarStatusConsulta(c.id, 'REALIZADA', obs || '');
              }}>
                Finalizar
              </button>
              <button style={{ ...botao, backgroundColor: '#6c757d' }} onClick={() => iniciarReagendamento(c)}>
                Reagendar
              </button>
              <button style={{ ...botao, backgroundColor: '#17a2b8' }} onClick={() => visualizarHistoricoPaciente(c)}>
                Ver Histórico
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
