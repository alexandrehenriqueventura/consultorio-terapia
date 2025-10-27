const db = require('../config/database');

class Paciente {
  static async findAll() {
    const query = `
      SELECT p.*, 
             pg.valor_sessao, pg.forma_pagamento, pg.dia_vencimento,
             COUNT(c.id) as total_consultas
      FROM pacientes p
      LEFT JOIN pagamentos pg ON p.id = pg.paciente_id AND pg.ativo = true
      LEFT JOIN consultas c ON p.id = c.paciente_id
      WHERE p.ativo = true
      GROUP BY p.id, pg.valor_sessao, pg.forma_pagamento, pg.dia_vencimento
      ORDER BY p.nome ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, 
             pg.valor_sessao, pg.forma_pagamento, pg.dia_vencimento, pg.observacoes_pagamento
      FROM pacientes p
      LEFT JOIN pagamentos pg ON p.id = pg.paciente_id AND pg.ativo = true
      WHERE p.id = $1 AND p.ativo = true
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async create(pacienteData) {
    const {
      nome, cpf, data_nascimento, telefone, email,
      endereco_logradouro, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_cep, endereco_estado,
      profissao, estado_civil, contato_emergencia_nome, contato_emergencia_telefone
    } = pacienteData;

    const query = `
      INSERT INTO pacientes (
        nome, cpf, data_nascimento, telefone, email,
        endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_cep, endereco_estado,
        profissao, estado_civil, contato_emergencia_nome, contato_emergencia_telefone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      nome, cpf, data_nascimento, telefone, email,
      endereco_logradouro, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_cep, endereco_estado,
      profissao, estado_civil, contato_emergencia_nome, contato_emergencia_telefone
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, pacienteData) {
    const fields = Object.keys(pacienteData).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(pacienteData)];
    
    const query = `UPDATE pacientes SET ${fields} WHERE id = $1 RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'UPDATE pacientes SET ativo = false WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Paciente;
