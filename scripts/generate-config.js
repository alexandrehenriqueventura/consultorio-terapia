#!/usr/bin/env node
// ============================================
// Gera frontend/env-config.js com as variáveis
// de ambiente do arquivo .env (ou do ambiente CI)
// Execute antes do deploy: node scripts/generate-config.js
// ============================================
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const config = {
  FIREBASE_API_KEY:             process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN:         process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID:          process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET:      process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID:              process.env.FIREBASE_APP_ID,
};

const missing = Object.entries(config).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('❌ Variáveis de ambiente ausentes:', missing.join(', '));
  process.exit(1);
}

const out = `// GERADO AUTOMATICAMENTE — NÃO EDITAR MANUALMENTE\nwindow.__ENV = ${JSON.stringify(config, null, 2)};\n`;

const dest = path.join(__dirname, '..', 'frontend', 'env-config.js');
fs.writeFileSync(dest, out);
console.log('✅ frontend/env-config.js gerado com sucesso.');
