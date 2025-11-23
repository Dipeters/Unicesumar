import React, { useState, useEffect } from 'react';
import { usuarios } from '../../services/api';
import { estilos } from '../../utils/formatters';

const { card, label, input, botao } = estilos;

export default function PerfilPaciente({ usuario, onMensagem, onAtualizarUsuario }) {
  const [perfilNome, setPerfilNome] = useState('');
  const [perfilSobrenome, setPerfilSobrenome] = useState('');
  const [perfilTelefone, setPerfilTelefone] = useState('');
  const [perfilPossuiConvenio, setPerfilPossuiConvenio] = useState(false);
  const [perfilConvenioNome, setPerfilConvenioNome] = useState('');
  const [perfilNumeroConvenio, setPerfilNumeroConvenio] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    setPerfilNome(usuario.nome || '');
    setPerfilSobrenome(usuario.sobrenome || '');
    setPerfilTelefone(usuario.telefone || '');
    setPerfilPossuiConvenio(usuario.possui_convenio === 1);
    setPerfilConvenioNome(usuario.convenio_nome || '');
    setPerfilNumeroConvenio(usuario.numero_convenio || '');
  }, [usuario]);

  async function atualizarPerfil(e) {
    e.preventDefault();
    try {
      await usuarios.atualizarPerfil(usuario.id, {
        nome: perfilNome,
        sobrenome: perfilSobrenome,
        telefone: perfilTelefone,
        possui_convenio: perfilPossuiConvenio,
        convenio_nome: perfilPossuiConvenio ? perfilConvenioNome : null,
        numero_convenio: perfilPossuiConvenio ? perfilNumeroConvenio : null,
      });
      onMensagem('Perfil atualizado com sucesso!');
      if (onAtualizarUsuario) {
        onAtualizarUsuario({
          ...usuario,
          nome: perfilNome,
          sobrenome: perfilSobrenome,
          telefone: perfilTelefone,
          possui_convenio: perfilPossuiConvenio ? 1 : 0,
          convenio_nome: perfilConvenioNome,
          numero_convenio: perfilNumeroConvenio
        });
      }
    } catch (err) {
      onMensagem(err.message || 'Erro ao atualizar perfil.', 'erro');
    }
  }

  async function alterarSenha(e) {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      onMensagem('As senhas não coincidem.', 'erro');
      return;
    }
    if (novaSenha.length < 6) {
      onMensagem('A nova senha deve ter no mínimo 6 caracteres.', 'erro');
      return;
    }
    try {
      await usuarios.alterarSenha(usuario.id, senhaAtual, novaSenha);
      onMensagem('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      onMensagem(err.message || 'Erro ao alterar senha.', 'erro');
    }
  }

  return (
    <div style={card}>
      <h3>Meu Perfil</h3>
      <h4>Dados Pessoais</h4>
      <form onSubmit={atualizarPerfil}>
        <label style={label}>Nome</label>
<input
  style={{ ...input, backgroundColor: '#eee', cursor: 'not-allowed' }}
  type="text"
  value={perfilNome}
  disabled
  readOnly
/>

<label style={label}>Sobrenome</label>
<input
  style={{ ...input, backgroundColor: '#eee', cursor: 'not-allowed' }}
  type="text"
  value={perfilSobrenome}
  disabled
  readOnly
/>
        
        <label style={label}>Telefone</label>
        <input style={input} type="tel" value={perfilTelefone} onChange={(e) => setPerfilTelefone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
        
        <label style={{ display: 'flex', alignItems: 'center', marginTop: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={perfilPossuiConvenio} onChange={(e) => setPerfilPossuiConvenio(e.target.checked)} style={{ marginRight: '8px' }} />
          Possui Convênio
        </label>
        
        {perfilPossuiConvenio && (
          <>
            <label style={label}>Nome do Convênio</label>
            <input style={input} type="text" value={perfilConvenioNome} onChange={(e) => setPerfilConvenioNome(e.target.value)} placeholder="Ex: Unimed, IPERGS, etc." />
            
            <label style={label}>Número da Carteira</label>
            <input style={input} type="text" value={perfilNumeroConvenio} onChange={(e) => setPerfilNumeroConvenio(e.target.value)} />
          </>
        )}
        
        <button style={botao} type="submit">Salvar Alterações</button>
      </form>
      
      <hr style={{ margin: '20px 0' }} />
      
      <h4>Alterar Senha</h4>
      <form onSubmit={alterarSenha}>
        <label style={label}>Senha Atual</label>
        <input style={input} type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
        
        <label style={label}>Nova Senha</label>
        <input style={input} type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
        
        <label style={label}>Confirmar Nova Senha</label>
        <input style={input} type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
        
        <button style={botao} type="submit">Alterar Senha</button>
      </form>
    </div>
  );
}
