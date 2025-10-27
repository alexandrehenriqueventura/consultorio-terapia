{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const express = require('express');\
const cors = require('cors');\
const helmet = require('helmet');\
const rateLimit = require('express-rate-limit');\
require('dotenv').config();\
\
const app = express();\
const PORT = process.env.PORT || 3000;\
\
app.use(helmet());\
app.use(cors(\{\
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',\
  credentials: true\
\}));\
\
const limiter = rateLimit(\{\
  windowMs: 15 * 60 * 1000,\
  max: 100\
\});\
app.use(limiter);\
\
app.use(express.json(\{ limit: '10mb' \}));\
app.use(express.urlencoded(\{ extended: true \}));\
\
app.use('/api/pacientes', require('./routes/pacientes'));\
\
app.get('/health', (req, res) => \{\
  res.json(\{\
    status: 'OK',\
    timestamp: new Date().toISOString(),\
    service: 'Consult\'f3rio Terapia API'\
  \});\
\});\
\
app.use((err, req, res, next) => \{\
  console.error(err.stack);\
  res.status(500).json(\{\
    error: 'Algo deu errado!',\
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'\
  \});\
\});\
\
app.use('*', (req, res) => \{\
  res.status(404).json(\{ error: 'Rota n\'e3o encontrada' \});\
\});\
\
app.listen(PORT, () => \{\
  console.log(`\uc0\u55357 \u56960  Servidor rodando na porta $\{PORT\}`);\
  console.log(`\uc0\u55356 \u57104  Environment: $\{process.env.NODE_ENV || 'development'\}`);\
\});\
\
module.exports = app;\
}