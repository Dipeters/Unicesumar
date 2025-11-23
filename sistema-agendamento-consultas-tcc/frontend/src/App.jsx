import React, { useState } from 'react';
import Mensagem from './components/Mensagem';
import MenuLateral from './components/MenuLateral';
import Login from './pages/Login';

// Paciente
import PainelPaciente from './pages/Paciente/PainelPaciente';
import PerfilPaciente from './pages/Paciente/PerfilPaciente';
import HistoricoPaciente from './pages/Paciente/HistoricoPaciente';

// Médico
import ConsultasMedico from './pages/Medico/ConsultasMedico';
import AgendaMedico from './pages/Medico/AgendaMedico';
import BloquearAgendaMedico from './pages/Medico/BloquearAgendaMedico';
import HistoricoPacienteMedico from './pages/Medico/HistoricoPacienteMedico';

// Admin
import DashboardAdmin from './pages/Admin/DashboardAdmin';
import GerenciarConsultas from './pages/Admin/GerenciarConsultas';
import CadastrarMedico from './pages/Admin/CadastrarMedico';
import BloqueiosAdmin from './pages/Admin/BloqueiosAdmin';
import UsuariosAdmin from './pages/Admin/UsuariosAdmin';

import { estilos } from './utils/formatters';

const { container, card, botao } = estilos;

const opcoesMenuMedico = [
  { nome: 'Minhas Consultas', icone: '📋', tela: 'painel' },
  { nome: 'Agenda', icone: '📅', tela: 'minha-agenda' },
  { nome: 'Bloquear Horários', icone: '🚫', tela: 'bloquear-agenda' },
];

const opcoesMenuAdmin = [
  { nome: 'Dashboard', icone: '📊', tela: 'painel' },
  { nome: 'Todas Consultas', icone: '📋', tela: 'gerenciar-consultas' },
  { nome: 'Cadastrar Médico', icone: '👨‍⚕️', tela: 'cadastrar-medico' },
  { nome: 'Bloqueios', icone: '🚫', tela: 'bloqueios' },
  { nome: 'Usuários', icone: '👥', tela: 'usuarios' },
];

// 🔹 NOVO: menu lateral do paciente
const opcoesMenuPaciente = [
  { nome: 'Painel', icone: '🏠', tela: 'painel' },
  { nome: 'Meu Perfil', icone: '👤', tela: 'perfil' },
  { nome: 'Histórico', icone: '📜', tela: 'historico' },
];

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tela, setTela] = useState('painel');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('sucesso');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  function exibirMensagem(texto, tipo = 'sucesso') {
    setMensagem(texto);
    setTipoMensagem(tipo);
    setTimeout(() => setMensagem(''), 4000);
  }

  function handleLogin(usuarioLogado) {
    setUsuario(usuarioLogado);
    setTela('painel');
  }

  function sair() {
    setUsuario(null);
    setTela('painel');
    setPacienteSelecionado(null);
    exibirMensagem('Logout realizado com sucesso.');
  }

  function handleNavigate(tela, dados) {
    if (tela === 'historico-paciente') {
      setPacienteSelecionado(dados);
      setTela('historico-paciente');
    } else {
      setTela(tela);
    }
  }

  function renderizarConteudo() {
    if (!usuario) return null;

    // PACIENTE
    if (usuario.tipo === 'PACIENTE') {
      if (tela === 'painel') {
        return <PainelPaciente usuario={usuario} onMensagem={exibirMensagem} />;
      }
      if (tela === 'perfil') {
        return (
          <PerfilPaciente
            usuario={usuario}
            onMensagem={exibirMensagem}
            onAtualizarUsuario={setUsuario}
          />
        );
      }
      if (tela === 'historico') {
        return <HistoricoPaciente usuario={usuario} onMensagem={exibirMensagem} />;
      }
    }

    // MÉDICO
    if (usuario.tipo === 'MEDICO') {
      if (tela === 'painel') {
        return (
          <ConsultasMedico
            usuario={usuario}
            onMensagem={exibirMensagem}
            onNavigate={handleNavigate}
          />
        );
      }
      if (tela === 'minha-agenda') {
        return <AgendaMedico usuario={usuario} onMensagem={exibirMensagem} />;
      }
      if (tela === 'bloquear-agenda') {
        return <BloquearAgendaMedico usuario={usuario} onMensagem={exibirMensagem} />;
      }
      if (tela === 'historico-paciente') {
        return (
          <HistoricoPacienteMedico
            pacienteSelecionado={pacienteSelecionado}
            onVoltar={() => {
              setTela('painel');
              setPacienteSelecionado(null);
            }}
            onMensagem={exibirMensagem}
          />
        );
      }
    }

    // ADMIN
    if (usuario.tipo === 'ADMIN') {
      if (tela === 'painel') return <DashboardAdmin onMensagem={exibirMensagem} />;
      if (tela === 'gerenciar-consultas')
        return (
          <GerenciarConsultas
            onMensagem={exibirMensagem}
            onNavigate={handleNavigate}
          />
        );
      if (tela === 'cadastrar-medico')
        return <CadastrarMedico onMensagem={exibirMensagem} />;
      if (tela === 'bloqueios') return <BloqueiosAdmin onMensagem={exibirMensagem} />;
      if (tela === 'usuarios') return <UsuariosAdmin onMensagem={exibirMensagem} />;
    }

    return (
      <div style={card}>
        <p>Tela não encontrada</p>
      </div>
    );
  }

  // Tela de login
  if (!usuario) {
    return (
      <div style={container}>
        <Mensagem tipo={tipoMensagem} texto={mensagem} />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Define opções de menu conforme o tipo
  const opcoesMenu =
    usuario.tipo === 'ADMIN'
      ? opcoesMenuAdmin
      : usuario.tipo === 'MEDICO'
      ? opcoesMenuMedico
      : opcoesMenuPaciente;

  return (
    <div style={container}>
      <Mensagem tipo={tipoMensagem} texto={mensagem} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100vh',
          backgroundColor: '#ecf0f1',
        }}
      >
        {/* 🔹 Sidebar para TODOS os tipos (inclui PACIENTE agora) */}
        <MenuLateral
          opcoes={opcoesMenu}
          telaAtual={tela}
          aoClicar={setTela}
        />

        {/* Conteúdo principal */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Cabeçalho */}
          <div
            style={{
              ...card,
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white',
            }}
          >
            <div>
              <strong>Usuário:</strong> {usuario.nome} {usuario.sobrenome}
              <span
                style={{
                  marginLeft: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor:
                    usuario.tipo === 'ADMIN'
                      ? '#e74c3c'
                      : usuario.tipo === 'MEDICO'
                      ? '#3498db'
                      : '#27ae60',
                  color: 'white',
                }}
              >
                {usuario.tipo}
              </span>
            </div>

            <div>
              {/* 🔹 Para o paciente, navegação agora é pela sidebar, então deixamos só o botão Sair */}
              <button
                style={{ ...botao, backgroundColor: '#dc3545' }}
                onClick={sair}
              >
                Sair
              </button>
            </div>
          </div>

          {/* Conteúdo da tela atual */}
          {renderizarConteudo()}
        </div>
      </div>
    </div>
  );
}