// db.js - configuração do banco de dados SQLite
// Este arquivo é responsável por criar a conexão com o banco
// e garantir que as tabelas principais existam.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Caminho do arquivo de banco de dados (será criado automaticamente se não existir)
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Tabela de usuários do sistema - ATUALIZADA com todos os campos necessários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      sobrenome TEXT,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('PACIENTE','MEDICO','ADMIN')),
      telefone TEXT,
      possui_convenio INTEGER DEFAULT 0,
      convenio_nome TEXT,
      numero_convenio TEXT
    )
  `);

  // Tabela de médicos (informações adicionais)
  db.run(`
    CREATE TABLE IF NOT EXISTS medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      especialidade TEXT NOT NULL,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Tabela de consultas médicas
  db.run(`
    CREATE TABLE IF NOT EXISTS consultas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      medico_id INTEGER NOT NULL,
      data_hora TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AGENDADA',
      observacoes TEXT,
      FOREIGN KEY(paciente_id) REFERENCES usuarios(id),
      FOREIGN KEY(medico_id) REFERENCES usuarios(id)
    )
  `);

  // Tabela de bloqueios de agenda (para médicos e admin)
  db.run(`
    CREATE TABLE IF NOT EXISTS bloqueios_agenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medico_id INTEGER,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      motivo TEXT,
      tipo TEXT NOT NULL CHECK (tipo IN ('MEDICO','CLINICA')),
      turno TEXT CHECK (turno IN ('manha','tarde',NULL)),
      dias_semana TEXT,
      FOREIGN KEY(medico_id) REFERENCES usuarios(id)
    )
  `);

  // Cria um usuário administrador padrão, caso ainda não exista.
  const adminEmail = 'admin@clinica.com';
  db.get('SELECT * FROM usuarios WHERE email = ?', [adminEmail], (err, row) => {
    if (err) {
      console.error('Erro ao verificar admin padrão:', err);
      return;
    }
    if (!row) {
      const senhaHash = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO usuarios (nome, sobrenome, email, senha_hash, tipo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', 'Sistema', adminEmail, senhaHash, 'ADMIN'],
        (err2) => {
          if (err2) {
            console.error('Erro ao criar admin padrão:', err2);
          } else {
            console.log('Usuário administrador padrão criado: admin@clinica.com / admin123');
          }
        }
      );
    }
  });
});

module.exports = db;