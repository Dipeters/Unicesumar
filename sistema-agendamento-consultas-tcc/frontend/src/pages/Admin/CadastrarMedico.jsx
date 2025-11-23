import React, { useState, useEffect } from 'react';
import { admin } from '../../services/api';
import { estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function CadastrarMedico({ onMensagem }) {
  const [medNome, setMedNome] = useState('');
  const [medSobrenome, setMedSobrenome] = useState('');
  const [medEmail, setMedEmail] = useState('');
  const [medSenha, setMedSenha] = useState('');
  const [medEsp, setMedEsp] = useState('');
  const [medicos, setMedicos] = useState([]);

  useEffect(() => {
    carregarMedicos();
  }, []);

  async function carregarMedicos() {
    try {
      const dados = await admin.listarMedicos();
      setMedicos(dados);
    } catch (err) {
      onMensagem('Erro ao carregar médicos.', 'erro');
    }
  }

  async function criarMedico(e) {
    e.preventDefault();
    try {
      await admin.criarMedico({
        nome: medNome,
        sobrenome: medSobrenome,
        email: medEmail,
        senha: medSenha,
        especialidade: medEsp,
      });
      onMensagem('Médico cadastrado com sucesso!');
      setMedNome('');
      setMedSobrenome('');
      setMedEmail('');
      setMedSenha('');
      setMedEsp('');
      carregarMedicos();
    } catch (err) {
      onMensagem(err.message || 'Erro ao cadastrar médico.', 'erro');
    }
  }

  return (
    <div>
      <div style={card}>
        <h3>Cadastrar Novo Médico</h3>
        <form onSubmit={criarMedico}>
          <label style={label}>Nome</label>
          <input style={input} type="text" value={medNome} onChange={(e) => setMedNome(e.target.value)} required />

          <label style={label}>Sobrenome</label>
          <input style={input} type="text" value={medSobrenome} onChange={(e) => setMedSobrenome(e.target.value)} required />

          <label style={label}>Email</label>
          <input style={input} type="email" value={medEmail} onChange={(e) => setMedEmail(e.target.value)} required />

          <label style={label}>Senha</label>
          <input style={input} type="password" value={medSenha} onChange={(e) => setMedSenha(e.target.value)} required />

          <label style={label}>Especialidade</label>
          <input style={input} type="text" value={medEsp} onChange={(e) => setMedEsp(e.target.value)} placeholder="Ex: Cardiologia, Pediatria..." required />

          <button style={botao} type="submit">Cadastrar Médico</button>
        </form>
      </div>

      <div style={card}>
        <h3>Médicos Cadastrados ({medicos.length})</h3>
        {medicos.length === 0 && <p>Nenhum médico cadastrado.</p>}
        {medicos.map((m) => (
          <div key={m.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div><strong>Dr(a). {m.nome} {m.sobrenome}</strong></div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {m.especialidade} • {m.email}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
