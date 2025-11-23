import React, { useState, useEffect } from 'react';
import { medicos as medicosAPI, consultas, horarios } from '../../services/api';
import { formatarDataHora, estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function PainelPaciente({ usuario, onMensagem }) {
  const [medicos, setMedicos] = useState([]);
  const [consultasPaciente, setConsultasPaciente] = useState([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horaSelecionada, setHoraSelecionada] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  useEffect(() => {
    carregarMedicos();
    carregarConsultas();
  }, [usuario.id]);

  useEffect(() => {
    if (medicoSelecionado && dataSelecionada) {
      carregarHorarios();
    }
  }, [medicoSelecionado, dataSelecionada]);

  async function carregarMedicos() {
    try {
      const dados = await medicosAPI.listar();
      setMedicos(dados);
    } catch (err) {
      onMensagem('Erro ao carregar médicos.', 'erro');
    }
  }

  async function carregarConsultas() {
    try {
      const dados = await consultas.listarPorPaciente(usuario.id);
      setConsultasPaciente(dados);
    } catch (err) {
      onMensagem('Erro ao carregar consultas.', 'erro');
    }
  }

  async function carregarHorarios() {
    try {
      const dados = await horarios.disponiveis(medicoSelecionado, dataSelecionada);
      setHorariosDisponiveis(dados.horarios || []);
      setHoraSelecionada('');
    } catch (err) {
      setHorariosDisponiveis([]);
      onMensagem('Erro ao carregar horários.', 'erro');
    }
  }

  async function agendarConsulta(e) {
    e.preventDefault();
    try {
      await consultas.agendar({
      pacienteId: usuario.id,                      // ⬅ nome certo
      medicoId: medicoSelecionado,                // ⬅ nome certo
      dataHora: `${dataSelecionada}T${horaSelecionada}:00`, // ⬅ nome certo
    });

    onMensagem('Consulta agendada com sucesso!');
    setMedicoSelecionado('');
    setDataSelecionada('');
    setHoraSelecionada('');
    setHorariosDisponiveis([]);
    carregarConsultas();
  } catch (err) {
    onMensagem(err.message || 'Erro ao agendar consulta.', 'erro');
  }
}

  return (
    <div style={card}>
      <h3>Painel do Paciente</h3>

      <h4>Agendar nova consulta</h4>
      <form onSubmit={agendarConsulta}>
        <label style={label}>Médico</label>
        <select
          style={input}
          value={medicoSelecionado}
          onChange={(e) => setMedicoSelecionado(e.target.value)}
          required
        >
          <option value="">Selecione um médico</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome} {m.sobrenome} - {m.especialidade}
            </option>
          ))}
        </select>

        <label style={label}>Data</label>
        <input
          style={input}
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <label style={label}>Horário</label>
        <select
          style={input}
          value={horaSelecionada}
          onChange={(e) => setHoraSelecionada(e.target.value)}
          required
          disabled={!dataSelecionada || horariosDisponiveis.length === 0}
        >
          <option value="">
            {!dataSelecionada
              ? 'Selecione uma data primeiro'
              : horariosDisponiveis.length === 0
              ? 'Nenhum horário disponível'
              : 'Selecione um horário'}
          </option>
          {horariosDisponiveis.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        {dataSelecionada && horariosDisponiveis.length === 0 && (
          <div style={{ fontSize: '12px', color: '#ff8888', marginTop: '4px' }}>
            ⚠️ Não há horários disponíveis nesta data
          </div>
        )}

        <button style={botao} type="submit" disabled={horariosDisponiveis.length === 0}>
          Agendar
        </button>
      </form>

      <h4 style={{ marginTop: '24px' }}>Minhas consultas</h4>
      {consultasPaciente.length === 0 && <p>Você ainda não possui consultas agendadas.</p>}
      {consultasPaciente.map((c) => (
        <div key={c.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
          <div>
            <strong>Médico:</strong> {c.medico_nome} {c.medico_sobrenome} ({c.especialidade})
          </div>
          <div>
            <strong>Data/Hora:</strong> {formatarDataHora(c.data_hora)}
          </div>
          <div>
            <strong>Status:</strong>{' '}
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor:
                  c.status === 'REALIZADA'
                    ? '#d4edda'
                    : c.status === 'CANCELADA'
                    ? '#f8d7da'
                    : c.status === 'CONFIRMADA'
                    ? '#d1ecf1'
                    : '#fff3cd',
                color:
                  c.status === 'REALIZADA'
                    ? '#155724'
                    : c.status === 'CANCELADA'
                    ? '#721c24'
                    : c.status === 'CONFIRMADA'
                    ? '#0c5460'
                    : '#856404',
              }}
            >
              {c.status}
            </span>
          </div>
          {c.observacoes && (
            <div>
              <strong>Observações:</strong> {c.observacoes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
