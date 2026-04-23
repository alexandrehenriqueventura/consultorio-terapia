const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça nome de usuário e senha'
      });
    }

    // Buscar usuário no PostgreSQL
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Comparar senha com hash
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    const token = generateToken(user.id);
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login'
    });
  }
};

// Registro
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça todos os campos obrigatórios'
      });
    }

    // Verificar duplicidade no PostgreSQL
    const existingUser = await User.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário ou email já cadastrado'
      });
    }

    const newUser = await User.create({ username, email, password, role: role || 'user' });
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário'
    });
  }
};

// Verificar token (rota protegida)
exports.verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar token'
    });
  }
};

// Obter usuário atual (rota protegida)
exports.getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário'
    });
  }
};
