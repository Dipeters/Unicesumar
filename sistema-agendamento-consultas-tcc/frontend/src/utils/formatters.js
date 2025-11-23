// Função para formatar data para exibição (DD/MM/YYYY HH:MM)
export function formatarDataHora(dataHoraISO) {
  if (!dataHoraISO) return '';
  const data = new Date(dataHoraISO);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const hora = String(data.getHours()).padStart(2, '0');
  const min = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

// Função para formatar apenas data (DD/MM/YYYY)
export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Nomes dos dias da semana
export const diasSemanaNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Estilos compartilhados
export const estilos = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  
  titulo: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '20px',
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  
  label: {
    fontWeight: 'bold',
    display: 'block',
    marginTop: '8px',
    marginBottom: '4px',
  },
  
  botao: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginRight: '8px',
    marginTop: '8px',
  },
};
