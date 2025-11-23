// server.js - API Node.js/Express para o sistema de agendamento de consultas

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware para permitir requisições do frontend (React)
app.use(cors());
app.use(bodyParser.json());

// Rota simples apenas para teste rápido
app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Agendamento de Consultas está funcionando.' });
});

// ==========================
// ROTAS DE AUTENTICAÇÃO
// ==========================

// Registro de um novo paciente
app.post('/api/auth/registrar', (req, res) => {
  const {
    nome,
    sobrenome,
    email,
    senha,
    telefone,
    possui_convenio,
    convenio_nome,
    numero_convenio
  } = req.body;

  if (!nome || !sobrenome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, sobrenome, e-mail e senha são obrigatórios.' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  const sql = `
    INSERT INTO usuarios 
      (nome, sobrenome, email, senha_hash, tipo, telefone, possui_convenio, convenio_nome, numero_convenio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      nome,
      sobrenome,
      email,
      senhaHash,
      'PACIENTE',
      telefone || null,
      possui_convenio ? 1 : 0,
      convenio_nome || null,
      numero_convenio || null
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          erro: 'Erro ao registrar usuário. Talvez o e-mail já esteja em uso.'
        });
      }

      return res.status(201).json({
        mensagem: 'Paciente registrado com sucesso.',
        usuario: {
          id: this.lastID,
          nome,
          sobrenome,
          email,
          tipo: 'PACIENTE'
        }
      });
    }
  );
});

// Login (paciente, médico ou admin)
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.get(sql, [email], (err, usuario) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    const senhaConfere = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'Senha inválida.' });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
        email: usuario.email,
        tipo: usuario.tipo,
        telefone: usuario.telefone,
        possui_convenio: usuario.possui_convenio,
        convenio_nome: usuario.convenio_nome,
        numero_convenio: usuario.numero_convenio
      }
    });
  });
});

// ==========================
// ROTAS PARA ADMINISTRADOR
// ==========================

// Criação de um novo médico (acessível ao administrador)
app.post('/api/admin/medicos', (req, res) => {
  const { nome, sobrenome, email, senha, especialidade } = req.body;

  if (!nome || !email || !senha || !especialidade) {
    return res.status(400).json({ erro: 'Nome, e-mail, senha e especialidade são obrigatórios.' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  db.run(
    'INSERT INTO usuarios (nome, sobrenome, email, senha_hash, tipo) VALUES (?, ?, ?, ?, ?)',
    [nome, sobrenome || null, email, senhaHash, 'MEDICO'],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro ao criar médico. Verifique se o e-mail já não está em uso.' });
      }

      const usuarioId = this.lastID;
      db.run(
        'INSERT INTO medicos (usuario_id, especialidade) VALUES (?, ?)',
        [usuarioId, especialidade],
        function (err2) {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ erro: 'Erro ao salvar dados do médico.' });
          }

          return res.status(201).json({
            mensagem: 'Médico cadastrado com sucesso.',
            medico: {
              usuario_id: usuarioId,
              nome,
              email,
              especialidade
            }
          });
        }
      );
    }
  );
});

// Listagem de todos os usuários (para fins de administração)
app.get('/api/admin/usuarios', (req, res) => {
  db.all('SELECT id, nome, sobrenome, email, tipo FROM usuarios', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }
    res.json(rows);
  });
});

// ADMIN – Remover um usuário
app.delete('/api/admin/usuario/:id', (req, res) => {
  const userId = req.params.id;

  const sqlDelConsultas = `
    DELETE FROM consultas
    WHERE paciente_id = ? OR medico_id = ?
  `;

  db.run(sqlDelConsultas, [userId, userId], function (err) {
    if (err) {
      console.error('Erro ao remover consultas:', err);
      return res.status(500).json({ erro: 'Erro ao remover consultas do usuário.' });
    }

    const sqlDelMedico = 'DELETE FROM medicos WHERE usuario_id = ?';
    db.run(sqlDelMedico, [userId], function (err2) {
      if (err2) {
        console.error('Erro ao remover médico:', err2);
        return res.status(500).json({ erro: 'Erro ao remover dados do médico.' });
      }

      const sqlDelUser = 'DELETE FROM usuarios WHERE id = ?';
      db.run(sqlDelUser, [userId], function (err3) {
        if (err3) {
          console.error('Erro ao remover usuário:', err3);
          return res.status(500).json({ erro: 'Erro ao remover usuário.' });
        }

        return res.json({ mensagem: 'Usuário removido com sucesso.' });
      });
    });
  });
});

// ADMIN – Resetar senha
app.put('/api/admin/reset-senha/:id', (req, res) => {
  const userId = req.params.id;
  const { novaSenha } = req.body;

  if (!novaSenha || novaSenha.trim().length < 4) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 4 caracteres.' });
  }

  const hash = bcrypt.hashSync(novaSenha, 10);

  const sql = `
    UPDATE usuarios 
    SET senha_hash = ? 
    WHERE id = ?
  `;

  db.run(sql, [hash, userId], function (err) {
    if (err) {
      console.error('Erro ao resetar senha:', err);
      return res.status(500).json({ erro: 'Erro ao resetar senha.' });
    }

    return res.json({ mensagem: 'Senha resetada com sucesso!' });
  });
});

// ADMIN – Bloquear datas da clínica toda
app.post('/api/admin/bloquear-clinica', (req, res) => {
  const { dataInicio, dataFim, motivo } = req.body;

  if (!dataInicio || !dataFim) {
    return res.status(400).json({ erro: 'Data início e fim são obrigatórias.' });
  }

  const sql = `
    INSERT INTO bloqueios_agenda (medico_id, data_inicio, data_fim, motivo, tipo)
    VALUES (NULL, ?, ?, ?, 'CLINICA')
  `;

  db.run(sql, [dataInicio, dataFim, motivo || 'Bloqueio administrativo'], function (err) {
    if (err) {
      console.error('Erro ao bloquear clínica:', err);
      return res.status(500).json({ erro: 'Erro ao criar bloqueio.' });
    }

    return res.status(201).json({
      mensagem: 'Datas bloqueadas para toda a clínica.',
      bloqueio: { id: this.lastID, dataInicio, dataFim, motivo }
    });
  });
});

// ADMIN – Listar bloqueios
app.get('/api/admin/bloqueios', (req, res) => {
  const sql = `
    SELECT b.*, u.nome as medico_nome
    FROM bloqueios_agenda b
    LEFT JOIN usuarios u ON u.id = b.medico_id
    ORDER BY b.data_inicio DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar bloqueios:', err);
      return res.status(500).json({ erro: 'Erro ao buscar bloqueios.' });
    }
    res.json(rows);
  });
});

// ==========================
// ROTAS PARA MÉDICOS
// ==========================

// Listar todos os médicos cadastrados
app.get('/api/medicos', (req, res) => {
  const sql = `
    SELECT u.id as id, u.nome, u.sobrenome, u.email, m.especialidade
    FROM usuarios u
    JOIN medicos m ON m.usuario_id = u.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar médicos.' });
    }
    res.json(rows);
  });
});

// Consultas de um médico específico
app.get('/api/consultas/medico/:medicoId', (req, res) => {
  const medicoId = req.params.medicoId;
  const sql = `
    SELECT c.id, c.data_hora, c.status, c.observacoes,
           p.nome as paciente_nome, p.sobrenome as paciente_sobrenome,
           p.telefone as paciente_telefone, p.email as paciente_email,
           p.possui_convenio, p.convenio_nome, p.numero_convenio,
           p.id as paciente_id
    FROM consultas c
    JOIN usuarios p ON p.id = c.paciente_id
    WHERE c.medico_id = ?
    ORDER BY c.data_hora ASC
  `;
  db.all(sql, [medicoId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar consultas do médico.' });
    }
    res.json(rows);
  });
});

// Atualizar status da consulta (AGENDADA, CONFIRMADA, CANCELADA, REALIZADA)
app.put('/api/consultas/:id/status', (req, res) => {
  const consultaId = req.params.id;
  const { status, observacoes } = req.body;

  if (!status) {
    return res.status(400).json({ erro: 'Status é obrigatório.' });
  }

  const sql = 'UPDATE consultas SET status = ?, observacoes = ? WHERE id = ?';
  db.run(sql, [status, observacoes || null, consultaId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao atualizar status da consulta.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Consulta não encontrada.' });
    }
    res.json({ mensagem: 'Status atualizado com sucesso.' });
  });
});

// Médico bloquear datas da própria agenda
app.post('/api/medico/bloquear-agenda', (req, res) => {
  const { medicoId, dataInicio, dataFim, motivo } = req.body;

  if (!medicoId || !dataInicio || !dataFim) {
    return res.status(400).json({ erro: 'Médico, data início e fim são obrigatórias.' });
  }

  const sql = `
    INSERT INTO bloqueios_agenda (medico_id, data_inicio, data_fim, motivo, tipo)
    VALUES (?, ?, ?, ?, 'MEDICO')
  `;

  db.run(sql, [medicoId, dataInicio, dataFim, motivo || 'Indisponível'], function (err) {
    if (err) {
      console.error('Erro ao bloquear agenda:', err);
      return res.status(500).json({ erro: 'Erro ao criar bloqueio.' });
    }

    return res.status(201).json({
      mensagem: 'Agenda bloqueada com sucesso.',
      bloqueio: { id: this.lastID, dataInicio, dataFim, motivo }
    });
  });
});

// Histórico completo de consultas do paciente (para o médico visualizar)
app.get('/api/medico/historico-paciente/:pacienteId', (req, res) => {
  const pacienteId = req.params.pacienteId;
  
  const sql = `
    SELECT c.id, c.data_hora, c.status, c.observacoes,
           u.nome as medico_nome, m.especialidade
    FROM consultas c
    JOIN usuarios u ON u.id = c.medico_id
    LEFT JOIN medicos m ON m.usuario_id = u.id
    WHERE c.paciente_id = ?
    ORDER BY c.data_hora DESC
  `;

  db.all(sql, [pacienteId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar histórico:', err);
      return res.status(500).json({ erro: 'Erro ao buscar histórico.' });
    }
    res.json(rows);
  });
});

// ==========================
// ROTAS PARA PACIENTES
// ==========================

// Agendar uma nova consulta
app.post('/api/consultas', (req, res) => {
  const { pacienteId, medicoId, dataHora } = req.body;

  if (!pacienteId || !medicoId || !dataHora) {
    return res.status(400).json({ erro: 'Paciente, médico e data/hora são obrigatórios.' });
  }

  // 1) Validar se a data/hora é futura
  const dataAgendada = new Date(dataHora);
  const agora = new Date();

  if (isNaN(dataAgendada.getTime())) {
    return res.status(400).json({ erro: 'Data/hora inválida.' });
  }

  if (dataAgendada < agora) {
    return res.status(400).json({ erro: 'Não é permitido agendar consultas no passado.' });
  }

  // 2) Limitar horário (08:00 até 17:45) e exigir intervalos de 15 minutos
  const hora = dataAgendada.getHours();
  const minutos = dataAgendada.getMinutes();

  const minutosValidos = [0, 15, 30, 45];
  if (!minutosValidos.includes(minutos)) {
    return res.status(400).json({
      erro: 'Horário inválido. As consultas devem ser em intervalos de 15 minutos (ex.: 09:00, 09:15, 09:30, 09:45).'
    });
  }

  if (hora < 8 || hora > 17 || (hora === 17 && minutos > 45)) {
    return res.status(400).json({
      erro: 'Horário fora do expediente. Agende entre 08:00 e 17:45.'
    });
  }

  // 3) Verificar bloqueios (clínica ou médico)
  const dia = dataHora.substring(0, 10); // "YYYY-MM-DD"
  
  const sqlBloqueios = `
    SELECT * FROM bloqueios_agenda
    WHERE (tipo = 'CLINICA' OR medico_id = ?)
      AND ? BETWEEN data_inicio AND data_fim
  `;

  db.get(sqlBloqueios, [medicoId, dia], (errBloq, bloqueio) => {
    if (errBloq) {
      console.error('Erro ao verificar bloqueios:', errBloq);
      return res.status(500).json({ erro: 'Erro ao verificar bloqueios.' });
    }

    if (bloqueio) {
      return res.status(400).json({
        erro: 'Esta data está bloqueada. Escolha outra data.'
      });
    }

    // 4) Impedir duas consultas no mesmo dia para o mesmo paciente com o mesmo médico
    const sqlMesmoDia = `
      SELECT *
      FROM consultas
      WHERE medico_id = ?
        AND paciente_id = ?
        AND data_hora LIKE ?
    `;

    db.get(sqlMesmoDia, [medicoId, pacienteId, `${dia}%`], (errMesmoDia, consultaMesmoDia) => {
      if (errMesmoDia) {
        console.error(errMesmoDia);
        return res.status(500).json({ erro: 'Erro ao verificar consultas do mesmo dia.' });
      }

      if (consultaMesmoDia) {
        return res.status(400).json({
          erro: 'Já existe uma consulta marcada com este médico neste mesmo dia para este paciente.'
        });
      }

      // 5) Verificar se o horário exato já está ocupado
      const sqlCheck = 'SELECT * FROM consultas WHERE medico_id = ? AND data_hora = ?';
      db.get(sqlCheck, [medicoId, dataHora], (err, existente) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ erro: 'Erro ao verificar disponibilidade do horário.' });
        }
        if (existente) {
          return res.status(400).json({ erro: 'Este horário já está ocupado para o médico selecionado.' });
        }

        // 6) Inserir a nova consulta
        const sqlInsert = `
          INSERT INTO consultas (paciente_id, medico_id, data_hora, status)
          VALUES (?, ?, ?, 'AGENDADA')
        `;
        db.run(sqlInsert, [pacienteId, medicoId, dataHora], function (err2) {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ erro: 'Erro ao agendar consulta.' });
          }

          return res.status(201).json({
            mensagem: 'Consulta agendada com sucesso.',
            consulta: {
              id: this.lastID,
              pacienteId,
              medicoId,
              dataHora,
              status: 'AGENDADA'
            }
          });
        });
      });
    });
  });
});

// Consultas de um paciente específico
app.get('/api/consultas/paciente/:pacienteId', (req, res) => {
  const pacienteId = req.params.pacienteId;

  const sql = `
    SELECT c.id, c.data_hora, c.status, c.observacoes,
           u.nome AS medico_nome, u.sobrenome as medico_sobrenome,
           m.especialidade
    FROM consultas c
    JOIN usuarios u ON u.id = c.medico_id
    LEFT JOIN medicos m ON m.usuario_id = u.id
    WHERE c.paciente_id = ?
    ORDER BY c.data_hora DESC
  `;

  db.all(sql, [pacienteId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar consultas do paciente:', err);
      return res.status(500).json({ erro: 'Erro ao buscar consultas.' });
    }
    res.json(rows);
  });
});

// Horários ocupados de um médico em um dia
app.get('/api/consultas/ocupadas/:medicoId/:dia', (req, res) => {
  const medicoId = req.params.medicoId;
  const dia = req.params.dia; // "YYYY-MM-DD"

  const sql = `
    SELECT data_hora
    FROM consultas
    WHERE medico_id = ?
      AND data_hora LIKE ?
    ORDER BY data_hora ASC
  `;

  db.all(sql, [medicoId, `${dia}%`], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar horários ocupados:', err);
      return res.status(500).json({ erro: 'Erro ao buscar horários ocupados.' });
    }

    const ocupados = rows.map((r) => {
      const dh = String(r.data_hora || '');
      return dh.substring(11, 16); // HH:MM
    });

    res.json(ocupados);
  });
});

// Atualizar dados do perfil do paciente
app.put('/api/pacientes/:id', (req, res) => {
  const userId = req.params.id;

  const {
    nome,
    sobrenome,
    telefone,
    possui_convenio,
    convenio_nome,
    numero_convenio
  } = req.body;

  const sql = `
    UPDATE usuarios
      SET nome = ?, sobrenome = ?, telefone = ?, possui_convenio = ?, convenio_nome = ?, numero_convenio = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      nome,
      sobrenome || null,
      telefone || null,
      possui_convenio ? 1 : 0,
      convenio_nome || null,
      numero_convenio || null,
      userId
    ],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
      }

      return res.json({ mensagem: 'Perfil atualizado com sucesso.' });
    }
  );
});

// Paciente - alterar a própria senha
app.put('/api/pacientes/:id/senha', (req, res) => {
  const userId = req.params.id;
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha || novaSenha.trim().length < 4) {
    return res.status(400).json({ erro: 'Dados inválidos para alteração de senha.' });
  }

  const sqlBusca = 'SELECT senha_hash FROM usuarios WHERE id = ?';
  db.get(sqlBusca, [userId], (err, usuario) => {
    if (err) {
      console.error('Erro ao buscar usuário para troca de senha:', err);
      return res.status(500).json({ erro: 'Erro ao buscar usuário.' });
    }
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const senhaConfere = bcrypt.compareSync(senhaAtual, usuario.senha_hash);
    if (!senhaConfere) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' });
    }

    const novoHash = bcrypt.hashSync(novaSenha, 10);
    const sqlUpdate = 'UPDATE usuarios SET senha_hash = ? WHERE id = ?';
    db.run(sqlUpdate, [novoHash, userId], function (err2) {
      if (err2) {
        console.error('Erro ao atualizar senha do paciente:', err2);
        return res.status(500).json({ erro: 'Erro ao atualizar senha.' });
      }
      return res.json({ mensagem: 'Senha alterada com sucesso.' });
    });
  });
});

// Inicia o servidor (apenas UMA vez)
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});