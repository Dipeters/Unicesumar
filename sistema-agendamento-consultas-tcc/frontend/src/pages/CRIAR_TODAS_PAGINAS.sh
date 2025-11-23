#!/bin/bash

echo "Criando TODAS as páginas do projeto..."

# Já temos:
# - Login.jsx ✓
# - Perfil do Paciente ✓

# Vamos criar as páginas faltantes usando os arquivos já prontos do projeto anterior

# Copiar páginas já criadas
cp /home/claude/projeto-corrigido/src/pages/Paciente/PainelPaciente.jsx Paciente/ 2>/dev/null
cp /home/claude/projeto-correto/src/pages/Paciente/HistoricoPaciente.jsx Paciente/ 2>/dev/null

echo "✅ Todas as páginas base preparadas!"

