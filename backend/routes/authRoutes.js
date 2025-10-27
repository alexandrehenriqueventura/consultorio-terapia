const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas (não precisam de autenticação)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rota protegida para verificar token
router.get('/verify', authMiddleware, authController.verifyToken);

// Rota para obter dados do usuário atual
router.get('/user', authMiddleware, authController.getCurrentUser);

module.exports = router;
