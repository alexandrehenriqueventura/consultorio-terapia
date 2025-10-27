const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// Login controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Por favor, forneça nome de usuário e senha' 
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
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

// Register controller (optional, for creating users)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Por favor, forneça todos os campos obrigatórios' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Usuário ou email já cadastrado' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
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

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    // User is already attached to req by auth middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
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
