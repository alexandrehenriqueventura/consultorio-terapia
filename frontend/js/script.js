// ==========================================
// SISTEMA DE AUTENTICAÇÃO E SPA
// ==========================================

// Configuração da API
const API_BASE_URL = '/api';

// Gerenciamento de Token JWT
const TokenManager = {
  get: () => localStorage.getItem('authToken'),
  set: (token) => localStorage.setItem('authToken', token),
  remove: () => localStorage.removeItem('authToken'),
  isValid: () => !!TokenManager.get()
};

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticação ao carregar a página
  checkAuthentication();
});

// ==========================================
// SISTEMA DE AUTENTICAÇÃO
// ==========================================

function checkAuthentication() {
  const token = TokenManager.get();
  
  if (!token) {
    // Usuário não autenticado - mostrar tela de login
    showLoginScreen();
    return;
  }
  
  // Verificar se o token é válido
  verifyToken()
    .then(isValid => {
      if (isValid) {
        // Token válido - inicializar aplicação
        initializeApp();
      } else {
        // Token inválido - mostrar tela de login
        TokenManager.remove();
        showLoginScreen();
      }
    })
    .catch(() => {
      // Erro na verificação - mostrar tela de login
      TokenManager.remove();
      showLoginScreen();
    });
}

function showLoginScreen() {
  // Ocultar toda a aplicação
  const appContainer = document.getElementById('app-container');
  const loginContainer = document.getElementById('login-container');
  
  if (appContainer) appContainer.style.display = 'none';
  if (loginContainer) loginContainer.style.display = 'flex';
  
  // Configurar formulário de login
  setupLoginForm();
}

function showAppScreen() {
  // Mostrar a aplicação e ocultar login
  const appContainer = document.getElementById('app-container');
  const loginContainer = document.getElementById('login-container');
  
  if (appContainer) appContainer.style.display = 'block';
  if (loginContainer) loginContainer.style.display = 'none';
}

function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;
  
  // Remover listeners anteriores (se existirem)
  const newForm = loginForm.cloneNode(true);
  loginForm.parentNode.replaceChild(newForm, loginForm);
  
  newForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    await handleLogin(e);
  });
}

async function handleLogin(e) {
  const form = e.target;
  const email = form.querySelector('[name="email"]')?.value;
  const password = form.querySelector('[name="password"]')?.value;
  const loginButton = form.querySelector('button[type="submit"]');
  const errorMessage = document.getElementById('login-error');
  
  // Limpar mensagem de erro
  if (errorMessage) errorMessage.style.display = 'none';
  
  // Validação básica
  if (!email || !password) {
    showLoginError('Por favor, preencha todos os campos');
    return;
  }
  
  // Desabilitar botão durante o login
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }
    
    // Salvar token
    TokenManager.set(data.token);
    
    // Inicializar aplicação
    initializeApp();
    
  } catch (error) {
    console.error('Erro no login:', error);
    showLoginError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
  } finally {
    // Reabilitar botão
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.textContent = 'Entrar';
    }
  }
}

function showLoginError(message) {
  const errorElement = document.getElementById('login-error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    alert(message);
  }
}

async function verifyToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TokenManager.get()}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return false;
  }
}

function logout() {
  // Remover token
  TokenManager.remove();
  
  // Mostrar tela de login
  showLoginScreen();
  
  // Limpar dados da sessão
  showMessage('Logout realizado com sucesso', 'success');
}

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================

function initializeApp() {
  // Mostrar interface da aplicação
  showAppScreen();
  
  // Inicializar componentes
  initNavigation();
  loadPacientes();
  setupFormPacientes();
  setupLogoutButton();
  
  // Mostrar tab inicial (dashboard)
  showTab('dashboard');
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    // Remover listener anterior se existir
    const newBtn = logoutBtn.cloneNode(true);
    logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
    
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

// ==========================================
// NAVEGAÇÃO SPA
// ==========================================

function initNavigation() {
  // Gerenciar navegação entre abas
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      const targetTab = this.dataset.tab;
      showTab(targetTab);
    });
  });
}

function showTab(tabName) {
  // Ocultar todas as abas
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Mostrar aba selecionada
  const targetContent = document.querySelector(`[data-content="${tabName}"]`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
  
  // Atualizar navegação ativa
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
}

// ==========================================
// GERENCIAMENTO DE PACIENTES
// ==========================================

function loadPacientes() {
  fetch(`${API_BASE_URL}/pacientes`, {
    headers: {
      'Authorization': `Bearer ${TokenManager.get()}`
    }
  })
    .then(res => {
      if (res.status === 401) {
        // Token inválido ou expirado
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        throw new Error('Erro ao carregar pacientes');
      }
      return res.json();
    })
    .then(data => {
      renderPacientesList(data);
    })
    .catch(error => {
      console.error('Erro ao carregar pacientes:', error);
      if (error.message !== 'Sessão expirada') {
        showMessage('Erro ao carregar lista de pacientes', 'error');
      }
    });
}

function renderPacientesList(pacientes) {
  const listContainer = document.getElementById('pacientes-list');
  if (!listContainer) return;
  
  if (!pacientes || pacientes.length === 0) {
    listContainer.innerHTML = '<p class="empty-message">Nenhum paciente cadastrado.</p>';
    return;
  }
  
  let html = '<table class="pacientes-table">';
  html += '<thead><tr>';
  html += '<th>Nome</th>';
  html += '<th>CPF</th>';
  html += '<th>Telefone</th>';
  html += '<th>Email</th>';
  html += '<th>Ações</th>';
  html += '</tr></thead><tbody>';
  
  pacientes.forEach(paciente => {
    html += '<tr>';
    html += `<td>${escapeHtml(paciente.nome || '')}</td>`;
    html += `<td>${escapeHtml(paciente.cpf || '')}</td>`;
    html += `<td>${escapeHtml(paciente.telefone || '')}</td>`;
    html += `<td>${escapeHtml(paciente.email || '')}</td>`;
    html += '<td>';
    html += `<button class="btn-edit" data-id="${paciente.id}">Editar</button> `;
    html += `<button class="btn-delete" data-id="${paciente.id}">Excluir</button>`;
    html += '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  listContainer.innerHTML = html;
}

function setupFormPacientes() {
  const form = document.getElementById('form-paciente');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitPacienteForm();
  });
}

function submitPacienteForm() {
  const form = document.getElementById('form-paciente');
  if (!form) return;
  
  // Coletar dados do formulário
  const formData = {
    nome: form.querySelector('[name="nome"]')?.value,
    cpf: form.querySelector('[name="cpf"]')?.value,
    telefone: form.querySelector('[name="telefone"]')?.value,
    email: form.querySelector('[name="email"]')?.value,
    data_nascimento: form.querySelector('[name="data_nascimento"]')?.value,
    endereco: form.querySelector('[name="endereco"]')?.value,
    observacoes: form.querySelector('[name="observacoes"]')?.value
  };
  
  // Validação básica
  if (!formData.nome || !formData.cpf) {
    showMessage('Nome e CPF são obrigatórios', 'error');
    return;
  }
  
  // Enviar dados para API com token JWT
  fetch(`${API_BASE_URL}/pacientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TokenManager.get()}`
    },
    body: JSON.stringify(formData)
  })
    .then(res => {
      if (res.status === 401) {
        // Token inválido ou expirado
        logout();
        throw new Error('Sessão expirada');
      }
      if (!res.ok) {
        throw new Error('Erro ao cadastrar paciente');
      }
      return res.json();
    })
    .then(data => {
      showMessage('Paciente cadastrado com sucesso!', 'success');
      form.reset();
      // Atualizar lista de pacientes automaticamente
      loadPacientes();
    })
    .catch(error => {
      console.error('Erro ao cadastrar paciente:', error);
      if (error.message !== 'Sessão expirada') {
        showMessage('Erro ao cadastrar paciente. Tente novamente.', 'error');
      }
    });
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function showMessage(message, type) {
  const messageContainer = document.getElementById('message-container');
  if (!messageContainer) {
    alert(message);
    return;
  }
  
  messageContainer.textContent = message;
  messageContainer.className = `message ${type}`;
  messageContainer.style.display = 'block';
  
  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 3000);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}
