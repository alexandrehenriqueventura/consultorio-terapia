const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Rotas REST para Pacientes

// POST /api/pacientes - Criar novo paciente
router.post('/', pacienteController.create);

// GET /api/pacientes - Listar todos os pacientes
router.get('/', pacienteController.getAll);

// GET /api/pacientes/:id - Buscar paciente por ID
router.get('/:id', pacienteController.getById);

// PUT /api/pacientes/:id - Atualizar paciente
router.put('/:id', pacienteController.update);

// DELETE /api/pacientes/:id - Deletar paciente
router.delete('/:id', pacienteController.delete);

module.exports = router;
