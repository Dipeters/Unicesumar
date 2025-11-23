import React, { useState } from 'react';
import Mensagem from '../components/Mensagem';
import { auth } from '../services/api';
import { estilos } from '../utils/formatters';

const { card, label, input, botao } = estilos;

export default function Login({ onLogin }) {
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Estados para registro
  const [regNome, setRegNome] = useState('');
  const [regSobrenome, setRegSobrenome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regPossuiConvenio, setRegPossuiConvenio] = useState(false);
  const [regConvenioNome, setRegConvenioNome] = useState('');
  const [regNumeroConvenio, setRegNumeroConvenio] = useState('');

  // Estados para mensagens
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('sucesso');

  function exibirMensagem(texto, tipo = 'sucesso') {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(''), 4000);
  }

  async function fazerLogin(e) {
    e.preventDefault();
    try {
      const dados = await auth.login(loginEmail, loginSenha);
      exibirMensagem('Login realizado com sucesso.');
      onLogin(dados.usuario);
    } catch (err) {
      exibirMensagem(err.message || 'Erro ao fazer login.', 'erro');
    }
  }

  async function registrarPaciente(e) {
    e.preventDefault();
    try {
      const dados = {
        nome: regNome,
        sobrenome: regSobrenome,
        email: regEmail,
        senha: regSenha,
        telefone: regTelefone,
        possui_convenio: regPossuiConvenio,
        convenio_nome: regPossuiConvenio ? regConvenioNome : null,
        numero_convenio: regPossuiConvenio ? regNumeroConvenio : null,
      };

      await auth.registrar(dados);
      exibirMensagem('Cadastro realizado com sucesso! Faça login para continuar.');
      
      // Limpar formulário
      setRegNome('');
      setRegSobrenome('');
      setRegEmail('');
      setRegSenha('');
      setRegTelefone('');
      setRegPossuiConvenio(false);
      setRegConvenioNome('');
      setRegNumeroConvenio('');
    } catch (err) {
      exibirMensagem(err.message || 'Erro ao cadastrar.', 'erro');
    }
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
        Sistema de Agendamento de Consultas
      </h2>

      <Mensagem tipo={tipoMensagem} texto={mensagem} />

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Card de Login */}
        <div style={{ ...card, flex: '1 1 400px' }}>
          <h3>Login</h3>
          <form onSubmit={fazerLogin}>
            <label style={label}>E-mail</label>
            <input
              style={input}
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            
            <label style={label}>Senha</label>
            <input
              style={input}
              type="password"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              required
            />
            
            <button style={botao} type="submit">
              Entrar
            </button>
          </form>
        </div>

        {/* Card de Registro */}
        <div style={{ ...card, flex: '1 1 400px' }}>
          <h3>Cadastro de Paciente</h3>
          <form onSubmit={registrarPaciente}>
            <label style={label}>Nome *</label>
            <input
              style={input}
              type="text"
              value={regNome}
              onChange={(e) => setRegNome(e.target.value)}
              required
            />
            
            <label style={label}>Sobrenome *</label>
            <input
              style={input}
              type="text"
              value={regSobrenome}
              onChange={(e) => setRegSobrenome(e.target.value)}
              required
            />
            
            <label style={label}>E-mail *</label>
            <input
              style={input}
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            
            <label style={label}>Senha *</label>
            <input
              style={input}
              type="password"
              value={regSenha}
              onChange={(e) => setRegSenha(e.target.value)}
              required
            />
            
            <label style={label}>Telefone</label>
            <input
              style={input}
              type="tel"
              value={regTelefone}
              onChange={(e) => setRegTelefone(e.target.value)}
              placeholder="(XX) XXXXX-XXXX"
            />
            
            <label style={{ display: 'flex', alignItems: 'center', marginTop: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={regPossuiConvenio}
                onChange={(e) => setRegPossuiConvenio(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Possui Convênio
            </label>
            
            {regPossuiConvenio && (
              <>
                <label style={label}>Nome do Convênio</label>
                <input
                  style={input}
                  type="text"
                  value={regConvenioNome}
                  onChange={(e) => setRegConvenioNome(e.target.value)}
                  placeholder="Ex: Unimed, IPERGS, etc."
                />
                
                <label style={label}>Número da Carteira</label>
                <input
                  style={input}
                  type="text"
                  value={regNumeroConvenio}
                  onChange={(e) => setRegNumeroConvenio(e.target.value)}
                />
              </>
            )}
            
            <button style={botao} type="submit">
              Registrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
