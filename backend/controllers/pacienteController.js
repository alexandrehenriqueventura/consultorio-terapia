const Paciente = require('../models/Paciente');

// Whitelist de campos permitidos para atualização (proteção contra SQL injection)
const CAMPOS_PERMITIDOS = [
  'nome', 'cpf', 'data_nascimento', 'telefone', 'email',
  'endereco_logradouro', 'endereco_numero', 'endereco_complemento',
  'endereco_bairro', 'endereco_cidade', 'endereco_cep', 'endereco_estado',
  'profissao', 'estado_civil', 'contato_emergencia_nome', 'contato_emergencia_telefone'
];

// Criar novo paciente
exports.create = async (req, res) => {
  try {
    const {
      nome, cpf, data_nascimento, telefone, email,
      endereco_logradouro, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_cep, endereco_estado,
      profissao, estado_civil, contato_emergencia_nome, contato_emergencia_telefone
    } = req.body;

    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    const paciente = await Paciente.create({
      nome, cpf, data_nascimento, telefone, email,
      endereco_logradouro, endereco_numero, endereco_complemento,
      endereco_bairro, endereco_cidade, endereco_cep, endereco_estado,
      profissao, estado_civil, contato_emergencia_nome, contato_emergencia_telefone
    });

    res.status(201).json({ paciente, message: 'Paciente criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
};

// Listar todos os pacientes
exports.getAll = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll();
    res.status(200).json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
};

// Buscar paciente por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.status(200).json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
};

// Atualizar paciente (com whitelist de campos)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Filtrar apenas campos permitidos para evitar SQL injection
    const dadosValidos = {};
    for (const campo of CAMPOS_PERMITIDOS) {
      if (req.body[campo] !== undefined) {
        dadosValidos[campo] = req.body[campo];
      }
    }

    if (Object.keys(dadosValidos).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    }

    const updated = await Paciente.update(id, dadosValidos);
    if (!updated) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.status(200).json({ paciente: updated, message: 'Paciente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
};

// Deletar paciente (soft delete)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Paciente.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    res.status(200).json({ message: 'Paciente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    res.status(500).json({ error: 'Erro ao deletar paciente' });
  }
};
