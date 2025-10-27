// Exemplo SPA JS básico para Dashboard e navegação
// Implementa cadastro e listagem de pacientes

document.addEventListener('DOMContentLoaded', function() {
  // Inicialização
  initNavigation();
  loadPacientes();
  setupFormPacientes();
});

// Navegação SPA
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

// Carregar e listar pacientes (GET /api/pacientes)
function loadPacientes() {
  fetch('/api/pacientes')
    .then(res => {
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
      showMessage('Erro ao carregar lista de pacientes', 'error');
    });
}

// Renderizar lista de pacientes na interface
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

// Configurar formulário de cadastro de pacientes
function setupFormPacientes() {
  const form = document.getElementById('form-paciente');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitPacienteForm();
  });
}

// Enviar formulário de cadastro (POST /api/pacientes)
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
  
  // Enviar dados para API
  fetch('/api/pacientes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(res => {
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
      showMessage('Erro ao cadastrar paciente. Tente novamente.', 'error');
    });
}

// Função auxiliar para exibir mensagens
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

// Função auxiliar para escapar HTML e prevenir XSS
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
