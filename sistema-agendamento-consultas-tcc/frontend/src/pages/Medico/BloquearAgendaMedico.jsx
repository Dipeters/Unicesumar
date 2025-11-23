import React, { useState, useEffect } from 'react';
import { bloqueios } from '../../services/api';
import { diasSemanaNomes, estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function BloquearAgendaMedico({ usuario, onMensagem }) {
  const [bloqDataInicio, setBloqDataInicio] = useState('');
  const [bloqDataFim, setBloqDataFim] = useState('');
  const [bloqMotivo, setBloqMotivo] = useState('');
  const [bloqTurno, setBloqTurno] = useState('');
  const [bloqDiasSemana, setBloqDiasSemana] = useState([]);

  const [bloqueiosAtivos, setBloqueiosAtivos] = useState([]);

  // ================================
  // 🔹 CARREGAR BLOQUEIOS DO MÉDICO
  // ================================
  useEffect(() => {
    carregarBloqueios();
  }, []);

  async function carregarBloqueios() {
    try {
      const dados = await bloqueios.listarPorMedico(usuario.id);
      setBloqueiosAtivos(dados);
    } catch (err) {
      onMensagem('Erro ao carregar bloqueios.', 'erro');
    }
  }

  function toggleDiaSemana(dia) {
    if (bloqDiasSemana.includes(dia)) {
      setBloqDiasSemana(bloqDiasSemana.filter((d) => d !== dia));
    } else {
      setBloqDiasSemana([...bloqDiasSemana, dia]);
    }
  }

  // ================================
  // 🔹 CRIAR NOVO BLOQUEIO
  // ================================
  async function bloquearAgendaMedico(e) {
    e.preventDefault();
    try {
      const diasSemanaSelecionados =
        bloqDiasSemana.length > 0 ? bloqDiasSemana.join(',') : null;

      await bloqueios.criar({
        medico_id: usuario.id,
        dataInicio: bloqDataInicio,
        dataFim: bloqDataFim,
        motivo: bloqMotivo,
        turno: bloqTurno || null,
        diasSemana: diasSemanaSelecionados,
      });

      onMensagem('Bloqueio criado com sucesso.');

      setBloqDataInicio('');
      setBloqDataFim('');
      setBloqMotivo('');
      setBloqTurno('');
      setBloqDiasSemana([]);

      carregarBloqueios();
    } catch (err) {
      onMensagem(err.message || 'Erro ao criar bloqueio.', 'erro');
    }
  }

  // ================================
  // 🔹 REMOVER BLOQUEIO (opcional)
  // ================================
  async function removerBloqueio(id) {
    if (!window.confirm('Deseja realmente remover este bloqueio?')) return;

    try {
      await bloqueios.remover(id);
      onMensagem('Bloqueio removido.');
      carregarBloqueios();
    } catch (err) {
      onMensagem('Erro ao remover bloqueio.', 'erro');
    }
  }

  return (
    <div style={card}>
      <h3>Bloquear Minha Agenda</h3>
      <p style={{ color: '#666' }}>Configure períodos em que você não estará disponível</p>

      {/* ======================
          FORMULÁRIO DE BLOQUEIO
      ======================= */}
      <form onSubmit={bloquearAgendaMedico}>
        <label style={label}>Data Início</label>
        <input
          style={input}
          type="date"
          value={bloqDataInicio}
          onChange={(e) => setBloqDataInicio(e.target.value)}
          required
        />

        <label style={label}>Data Fim</label>
        <input
          style={input}
          type="date"
          value={bloqDataFim}
          onChange={(e) => setBloqDataFim(e.target.value)}
          required
        />

        <label style={label}>Turno (opcional)</label>
        <select
          style={input}
          value={bloqTurno}
          onChange={(e) => setBloqTurno(e.target.value)}
        >
          <option value="">Dia inteiro</option>
          <option value="manha">Apenas manhã</option>
          <option value="tarde">Apenas tarde</option>
        </select>

        <label style={label}>Dias da Semana (opcional)</label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          {diasSemanaNomes.map((nome, idx) => (
            <label
              key={idx}
              style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}
            >
              <input
                type="checkbox"
                checked={bloqDiasSemana.includes(idx)}
                onChange={() => toggleDiaSemana(idx)}
                style={{ marginRight: '4px' }}
              />
              {nome}
            </label>
          ))}
        </div>

        <label style={label}>Motivo</label>
        <input
          style={input}
          type="text"
          value={bloqMotivo}
          onChange={(e) => setBloqMotivo(e.target.value)}
        />

        <button style={botao} type="submit">
          Bloquear Período
        </button>
      </form>

      {/* ======================
          LISTAGEM DE BLOQUEIOS
      ======================= */}
      <h3 style={{ marginTop: '32px' }}>🔒 Bloqueios Ativos</h3>

      {bloqueiosAtivos.length === 0 && <p>Nenhum bloqueio ativo no momento.</p>}

      {bloqueiosAtivos.map((b) => (
        <div
          key={b.id}
          style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '12px',
          }}
        >
          <div>
            <strong>Período:</strong> {b.data_inicio} até {b.data_fim}
          </div>

          <div>
            <strong>Turno:</strong>{' '}
            {b.turno ? (b.turno === 'manha' ? 'Manhã' : 'Tarde') : 'Dia inteiro'}
          </div>

          {b.dias_semana && (
            <div>
              <strong>Dias:</strong> {b.dias_semana}
            </div>
          )}

          <div>
            <strong>Motivo:</strong> {b.motivo}
          </div>

          <button
            style={{ ...botao, marginTop: '8px', background: '#dc3545' }}
            onClick={() => removerBloqueio(b.id)}
          >
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}