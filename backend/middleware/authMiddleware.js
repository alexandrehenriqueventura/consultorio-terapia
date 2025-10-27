const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Obter o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Token não fornecido' 
      });
    }

    // Extrair o token (formato: "Bearer <token>")
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_default');
    
    // Buscar o usuário no banco de dados
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Usuário não encontrado' 
      });
    }

    // Adicionar o usuário à requisição
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;
