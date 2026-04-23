const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Buscar usuário por username
  static async findByUsername(username) {
    const query = 'SELECT * FROM usuarios WHERE username = $1 AND ativo = true';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  // Buscar usuário por ID (sem retornar senha)
  static async findById(id) {
    const query = 'SELECT id, username, email, role, data_cadastro FROM usuarios WHERE id = $1 AND ativo = true';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Buscar usuário por email ou username (para verificar duplicidade)
  static async findByUsernameOrEmail(username, email) {
    const query = 'SELECT id FROM usuarios WHERE (username = $1 OR email = $2) AND ativo = true';
    const result = await db.query(query, [username, email]);
    return result.rows[0];
  }

  // Criar novo usuário
  static async create({ username, email, password, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuarios (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, data_cadastro
    `;
    const result = await db.query(query, [username, email, hashedPassword, role]);
    return result.rows[0];
  }

  // Comparar senha informada com o hash salvo no banco
  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;
