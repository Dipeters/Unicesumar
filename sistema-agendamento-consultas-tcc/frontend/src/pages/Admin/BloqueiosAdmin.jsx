import React, { useState, useEffect } from 'react';
import { admin, bloqueios } from '../../services/api';
import { diasSemanaNomes, formatarData, estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function BloqueiosAdmin({ onMensagem }) {
  const [bloqueiosLista, setBloqueiosLista] = useState([]);
  const [bloqDataInicio, setBloqDataInicio] = useState('');
  const [bloqDataFim, setBloqDataFim] = useState('');
  const [bloqMotivo, setBloqMotivo] = useState('');
  const [bloqTurno, setBloqTurno] = useState('');
  const [bloqDiasSemana, setBloqDiasSemana] = useState([]);

  useEffect(() => {
    carregarBloqueios();
  }, []);

  async function carregarBloqueios() {
    try {
      const dados = await admin.listarBloqueios();
      setBloqueiosLista(dados);
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

  async function bloquearClinica(e) {
    e.preventDefault();
    try {
      const diasSemanaSelecionados = bloqDiasSemana.length > 0 ? bloqDiasSemana.join(',') : null;

      await admin.criarBloqueio({
        dataInicio: bloqDataInicio,
        dataFim: bloqDataFim,
        motivo: bloqMotivo,
        turno: bloqTurno || null,
        diasSemana: diasSemanaSelecionados,
      });

      onMensagem('Bloqueio criado com sucesso!');
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

  async function removerBloqueio(id) {
    if (!window.confirm('Deseja realmente remover este bloqueio?')) return;
    try {
      await admin.removerBloqueio(id);
      onMensagem('Bloqueio removido com sucesso!');
      carregarBloqueios();
    } catch (err) {
      onMensagem(err.message || 'Erro ao remover bloqueio.', 'erro');
    }
  }

  return (
    <div>
      <div style={card}>
        <h3>Bloquear Clínica Inteira</h3>
        <p style={{ color: '#666' }}>Configure períodos em que a clínica estará fechada</p>

        <form onSubmit={bloquearClinica}>
          <label style={label}>Data Início</label>
          <input style={input} type="date" value={bloqDataInicio} onChange={(e) => setBloqDataInicio(e.target.value)} required />

          <label style={label}>Data Fim</label>
          <input style={input} type="date" value={bloqDataFim} onChange={(e) => setBloqDataFim(e.target.value)} required />

          <label style={label}>Turno (opcional)</label>
          <select style={input} value={bloqTurno} onChange={(e) => setBloqTurno(e.target.value)}>
            <option value="">Dia inteiro</option>
            <option value="manha">Apenas manhã (08:00-11:45)</option>
            <option value="tarde">Apenas tarde (12:00-17:45)</option>
          </select>

          <label style={label}>Dias da Semana (opcional)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            {diasSemanaNomes.map((nome, idx) => (
              <label key={idx} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <input type="checkbox" checked={bloqDiasSemana.includes(idx)} onChange={() => toggleDiaSemana(idx)} style={{ marginRight: '4px' }} />
                {nome}
              </label>
            ))}
          </div>

          <label style={label}>Motivo</label>
          <input style={input} type="text" value={bloqMotivo} onChange={(e) => setBloqMotivo(e.target.value)} placeholder="Ex: Feriado, Reforma..." required />

          <button style={botao} type="submit">Criar Bloqueio</button>
        </form>
      </div>

      <div style={card}>
        <h3>Bloqueios Ativos ({bloqueiosLista.length})</h3>
        {bloqueiosLista.length === 0 && <p>Nenhum bloqueio ativo.</p>}
        {bloqueiosLista.map((b) => (
          <div key={b.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div><strong>Período:</strong> {formatarData(b.data_inicio)} a {formatarData(b.data_fim)}</div>
            <div><strong>Motivo:</strong> {b.motivo}</div>
            {b.turno && <div><strong>Turno:</strong> {b.turno === 'manha' ? 'Manhã' : 'Tarde'}</div>}
            {b.dias_semana && <div><strong>Dias:</strong> {b.dias_semana}</div>}
            {b.medico_nome && <div><strong>Médico:</strong> Dr(a). {b.medico_nome} {b.medico_sobrenome}</div>}
            <button style={{ ...botao, backgroundColor: '#dc3545', marginTop: '8px' }} onClick={() => removerBloqueio(b.id)}>
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
