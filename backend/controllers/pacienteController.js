const Paciente = require('../models/Paciente');

// Criar novo paciente
exports.create = async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;
    
    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }
    
    const id = await Paciente.create({ nome, cpf, data_nascimento, telefone, email, endereco });
    res.status(201).json({ id, message: 'Paciente criado com sucesso' });
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

// Atualizar paciente
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, endereco } = req.body;
    
    const updated = await Paciente.update(id, { nome, cpf, data_nascimento, telefone, email, endereco });
    
    if (!updated) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }
    
    res.status(200).json({ message: 'Paciente atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
};

// Deletar paciente
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
