import React, { useState } from 'react';

export default function MenuLateral({ opcoes, telaAtual, aoClicar }) {
  const [menuAberto, setMenuAberto] = useState(true);

  return (
    <div style={{
      width: menuAberto ? '250px' : '60px',
      backgroundColor: '#2c3e50',
      minHeight: '100vh',
      padding: '16px 0',
      transition: 'width 0.3s',
      position: 'sticky',
      top: 0,
      left: 0
    }}>
      <div style={{
        padding: '0 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {menuAberto && <h3 style={{color: 'white', margin: 0}}>Menu</h3>}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ☰
        </button>
      </div>

      {opcoes.map((opcao, idx) => (
        <div
          key={idx}
          onClick={() => aoClicar(opcao.tela)}
          style={{
            padding: '12px 16px',
            color: telaAtual === opcao.tela ? '#3498db' : 'white',
            backgroundColor: telaAtual === opcao.tela ? 'rgba(52, 152, 219, 0.2)' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            borderLeft: telaAtual === opcao.tela ? '4px solid #3498db' : '4px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (telaAtual !== opcao.tela) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (telaAtual !== opcao.tela) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <span style={{fontSize: '20px'}}>{opcao.icone}</span>
          {menuAberto && <span>{opcao.nome}</span>}
        </div>
      ))}
    </div>
  );
}
