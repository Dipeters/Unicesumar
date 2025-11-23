import React from 'react';

// Componente para exibir mensagens de erro ou sucesso
export default function Mensagem({ tipo, texto }) {
  if (!texto) return null;
  
  const estilo = {
    padding: '8px 12px',
    margin: '8px 0',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: tipo === 'erro' ? '#ffdddd' : '#ddffdd',
    border: '1px solid',
    borderColor: tipo === 'erro' ? '#ff8888' : '#88cc88',
  };
  
  return <div style={estilo}>{texto}</div>;
}
