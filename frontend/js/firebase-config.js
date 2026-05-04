// ============================================
// FIREBASE CONFIG
// As variáveis abaixo são injetadas em tempo de
// build pelo script generate-config.js
// NÃO commit este arquivo com valores reais.
// Veja .env.example para configurar.
// ============================================

export const firebaseConfig = {
  apiKey:            window.__ENV?.FIREBASE_API_KEY            || '',
  authDomain:        window.__ENV?.FIREBASE_AUTH_DOMAIN        || '',
  projectId:         window.__ENV?.FIREBASE_PROJECT_ID        || '',
  storageBucket:     window.__ENV?.FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: window.__ENV?.FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             window.__ENV?.FIREBASE_APP_ID             || '',
};
