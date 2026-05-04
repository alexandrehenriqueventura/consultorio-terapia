// ============================================
// CONSULTÓRIO L'AMOUR PSIQUE - SISTEMA MODERNO
// Firebase Firestore | Modais reais | ES Modules
// ============================================

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, getDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// ============================================
// ESTADO ENCAPSULADO
// ============================================
const State = {
  currentUser: null,
  pacientes: [],
  consultas: [],
  editingPacienteId: null,
  editingConsultaId: null,
  paginaAtual: 1,
};

// ============================================
// INICIALIZAÇÃO
// ============================================
window.loadApp = async function () {
  State.currentUser = window.auth.currentUser;
  if (!State.currentUser) return;

  const userDoc = await getDoc(doc(window.db, 'users', State.currentUser.uid));
  if (!userDoc.exists() || userDoc.data().role !== 'admin') {
    alert('⚠️ Acesso negado - somente administradores');
    window.auth.signOut();
    return;
  }

  setupTabs();
  setupModais();
  await loadPacientes();
  await loadConsultas();
  updateDashboard();
};

// ============================================
// TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
      document.getElementById(btn.dataset.tab + '-tab').style.display = 'block';
    });
  });

  document.getElementById('add-paciente-btn').addEventListener('click', () => abrirModalPaciente());
  document.getElementById('add-consulta-btn').addEventListener('click', () => abrirModalConsulta());
}

// ============================================
// MODAIS
// ============================================
function setupModais() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharTodosModais();
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', fecharTodosModais);
  });

  document.getElementById('form-paciente').addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarPaciente();
  });

  document.getElementById('form-consulta').addEventListener('submit', async (e) => {
    e.preventDefault();
    await salvarConsulta();
  });
}

function fecharTodosModais() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
  State.editingPacienteId = null;
  State.editingConsultaId = null;
}

function abrirModalPaciente(paciente = null) {
  const modal = document.getElementById('modal-paciente');
  const titulo = document.getElementById('modal-paciente-titulo');
  const form = document.getElementById('form-paciente');

  form.reset();
  State.editingPacienteId = null;

  if (paciente) {
    titulo.textContent = 'Editar Paciente';
    State.editingPacienteId = paciente.id;
    document.getElementById('p-nome').value = paciente.nome || '';
    document.getElementById('p-telefone').value = paciente.telefone || '';
    document.getElementById('p-email').value = paciente.email || '';
    document.getElementById('p-cpf').value = paciente.cpf || '';
    document.getElementById('p-nascimento').value = paciente.dataNascimento || '';
    document.getElementById('p-profissao').value = paciente.profissao || '';
    document.getElementById('p-emergencia').value = paciente.contatoEmergencia || '';
  } else {
    titulo.textContent = 'Novo Paciente';
  }

  modal.style.display = 'flex';
}

function abrirModalConsulta(consulta = null) {
  const modal = document.getElementById('modal-consulta');
  const titulo = document.getElementById('modal-consulta-titulo');
  const form = document.getElementById('form-consulta');
  const selectPaciente = document.getElementById('c-paciente');

  form.reset();
  State.editingConsultaId = null;

  selectPaciente.innerHTML = '<option value="">Selecione o paciente...</option>' +
    State.pacientes.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

  if (consulta) {
    titulo.textContent = 'Editar Consulta';
    State.editingConsultaId = consulta.id;
    selectPaciente.value = consulta.pacienteId || '';
    document.getElementById('c-data').value = consulta.dataISO || '';
    document.getElementById('c-valor').value = consulta.valor || '';
    document.getElementById('c-observacoes').value = consulta.observacoes || '';
  } else {
    titulo.textContent = 'Nova Consulta';
  }

  modal.style.display = 'flex';
}

// ============================================
// PACIENTES - CRUD
// ============================================
async function loadPacientes() {
  const q = query(
    collection(window.db, 'pacientes'),
    where('ativo', '==', true),
    orderBy('nome', 'asc')
  );
  const snapshot = await getDocs(q);
  State.pacientes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  renderPacientes();
}

function renderPacientes() {
  const container = document.getElementById('pacientes-list');
  const busca = document.getElementById('busca-paciente')?.value?.toLowerCase() || '';
  const filtrados = busca
    ? State.pacientes.filter(p => p.nome?.toLowerCase().includes(busca) || p.email?.toLowerCase().includes(busca))
    : State.pacientes;

  if (filtrados.length === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhum paciente encontrado</p>';
    return;
  }

  container.innerHTML = filtrados.map(p => `
    <div class="list-card">
      <div class="list-card-info">
        <strong>${p.nome}</strong>
        <span>${p.telefone || 'Sem telefone'} &bull; ${p.email || 'Sem email'}</span>
        ${p.profissao ? `<span class="badge">${p.profissao}</span>` : ''}
      </div>
      <div class="list-card-actions">
        <button class="btn-icon btn-edit" onclick="window.editPaciente('${p.id}')" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-danger" onclick="window.deletePaciente('${p.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

async function salvarPaciente() {
  const btn = document.querySelector('#form-paciente .btn-submit');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  const dados = {
    nome: document.getElementById('p-nome').value.trim(),
    telefone: document.getElementById('p-telefone').value.trim(),
    email: document.getElementById('p-email').value.trim(),
    cpf: document.getElementById('p-cpf').value.trim(),
    dataNascimento: document.getElementById('p-nascimento').value,
    profissao: document.getElementById('p-profissao').value.trim(),
    contatoEmergencia: document.getElementById('p-emergencia').value.trim(),
  };

  if (!dados.nome) {
    mostrarErro('form-paciente', 'O nome é obrigatório.');
    btn.disabled = false;
    btn.textContent = 'Salvar';
    return;
  }

  try {
    if (State.editingPacienteId) {
      await updateDoc(doc(window.db, 'pacientes', State.editingPacienteId), dados);
    } else {
      await addDoc(collection(window.db, 'pacientes'), {
        ...dados,
        ativo: true,
        criadoEm: serverTimestamp(),
      });
    }
    fecharTodosModais();
    await loadPacientes();
    updateDashboard();
    mostrarToast('Paciente salvo com sucesso! ✓');
  } catch (err) {
    console.error(err);
    mostrarErro('form-paciente', 'Erro ao salvar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
}

window.editPaciente = function (id) {
  const paciente = State.pacientes.find(p => p.id === id);
  if (paciente) abrirModalPaciente(paciente);
};

window.deletePaciente = async function (id) {
  const paciente = State.pacientes.find(p => p.id === id);
  if (!paciente) return;

  const confirmado = await confirmarAcao(`Excluir <strong>${paciente.nome}</strong>? Esta ação não pode ser desfeita.`);
  if (!confirmado) return;

  await updateDoc(doc(window.db, 'pacientes', id), { ativo: false });
  await loadPacientes();
  updateDashboard();
  mostrarToast('Paciente removido.');
};

// ============================================
// CONSULTAS - CRUD
// ============================================
async function loadConsultas() {
  const q = query(collection(window.db, 'consultas'), orderBy('data', 'desc'));
  const snapshot = await getDocs(q);
  State.consultas = snapshot.docs.map(d => {
    const data = d.data();

    // FIX: trata data nula/inválida de forma segura
    let dataDate = null;
    try {
      if (data.data?.toDate) {
        dataDate = data.data.toDate();
      } else if (data.data) {
        const parsed = new Date(data.data);
        dataDate = isNaN(parsed.getTime()) ? null : parsed;
      }
    } catch (e) {
      console.warn(`Consulta ${d.id} com data inválida:`, e);
    }

    return {
      id: d.id,
      ...data,
      dataDate,
      dataISO: dataDate ? dataDate.toISOString().slice(0, 16) : '',
    };
  });
  // FIX: preserva a página atual após reload
  renderConsultas(State.paginaAtual);
}

function renderConsultas(pagina = 1) {
  const POR_PAGINA = 15;
  State.paginaAtual = pagina; // FIX: persiste página no estado
  const container = document.getElementById('consultas-list');
  const total = State.consultas.length;
  const inicio = (pagina - 1) * POR_PAGINA;
  const paginas = State.consultas.slice(inicio, inicio + POR_PAGINA);

  if (total === 0) {
    container.innerHTML = '<p class="empty-msg">Nenhuma consulta agendada</p>';
    return;
  }

  const html = paginas.map(c => {
    const paciente = State.pacientes.find(p => p.id === c.pacienteId) || { nome: 'Paciente desconhecido' };
    // FIX: exibe aviso se data for inválida em vez de quebrar
    const dataStr = c.dataDate
      ? c.dataDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      : '<span style="color:var(--danger)">Data inválida</span>';
    return `
      <div class="list-card">
        <div class="list-card-info">
          <strong>${paciente.nome}</strong>
          <span>${dataStr} &bull; R$ ${Number(c.valor || 0).toFixed(2).replace('.', ',')}</span>
          ${c.observacoes ? `<span class="obs">${c.observacoes}</span>` : ''}
        </div>
        <div class="list-card-actions">
          ${c.pago
            ? '<span class="badge badge-ok"><i class="fas fa-check"></i> Pago</span>'
            : `<button class="btn-icon btn-ok" onclick="window.marcarPago('${c.id}')" title="Marcar como pago"><i class="fas fa-dollar-sign"></i></button>`
          }
          <button class="btn-icon btn-edit" onclick="window.editConsulta('${c.id}')" title="Editar"><i class="fas fa-edit"></i></button>
        </div>
      </div>
    `;
  }).join('');

  const paginacao = total > POR_PAGINA ? `
    <div class="paginacao">
      ${pagina > 1 ? `<button class="btn-page" onclick="window.irPagina(${pagina - 1})">← Anterior</button>` : ''}
      <span>Página ${pagina} de ${Math.ceil(total / POR_PAGINA)}</span>
      ${pagina < Math.ceil(total / POR_PAGINA) ? `<button class="btn-page" onclick="window.irPagina(${pagina + 1})">Próxima →</button>` : ''}
    </div>
  ` : '';

  container.innerHTML = html + paginacao;
}

window.irPagina = function (p) { renderConsultas(p); };

async function salvarConsulta() {
  const btn = document.querySelector('#form-consulta .btn-submit');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  const pacienteId = document.getElementById('c-paciente').value;
  const dataVal = document.getElementById('c-data').value;
  const valor = parseFloat(document.getElementById('c-valor').value) || 0;
  const observacoes = document.getElementById('c-observacoes').value.trim();

  if (!pacienteId || !dataVal) {
    mostrarErro('form-consulta', 'Paciente e data são obrigatórios.');
    btn.disabled = false;
    btn.textContent = 'Salvar';
    return;
  }

  const dados = {
    pacienteId,
    data: new Date(dataVal),
    valor,
    observacoes,
  };

  try {
    if (State.editingConsultaId) {
      await updateDoc(doc(window.db, 'consultas', State.editingConsultaId), dados);
    } else {
      await addDoc(collection(window.db, 'consultas'), { ...dados, pago: false, criadoEm: serverTimestamp() });
    }
    fecharTodosModais();
    await loadConsultas();
    updateDashboard();
    mostrarToast('Consulta salva com sucesso! ✓');
  } catch (err) {
    console.error(err);
    mostrarErro('form-consulta', 'Erro ao salvar. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Salvar';
  }
}

window.editConsulta = function (id) {
  const consulta = State.consultas.find(c => c.id === id);
  if (consulta) abrirModalConsulta(consulta);
};

window.marcarPago = async function (id) {
  await updateDoc(doc(window.db, 'consultas', id), { pago: true, pagamentoEm: serverTimestamp() });
  await loadConsultas();
  updateDashboard();
  mostrarToast('Pagamento registrado! ✓');
};

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
  const agora = new Date();
  const mes = agora.getMonth();
  const ano = agora.getFullYear();

  document.getElementById('total-pacientes').textContent = State.pacientes.length;

  const consultasMes = State.consultas.filter(c => {
    return c.dataDate &&
      c.dataDate.getMonth() === mes &&
      c.dataDate.getFullYear() === ano;
  });
  document.getElementById('total-consultas').textContent = consultasMes.length;

  const pendentes = consultasMes.filter(c => !c.pago).reduce((s, c) => s + (c.valor || 0), 0);
  const recebidos = consultasMes.filter(c => c.pago).reduce((s, c) => s + (c.valor || 0), 0);

  document.getElementById('receita-pendente').textContent = 'R$ ' + pendentes.toFixed(2).replace('.', ',');
  document.getElementById('pagos').textContent = 'R$ ' + recebidos.toFixed(2).replace('.', ',');
}

// ============================================
// BUSCA DE PACIENTES (live)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const busca = document.getElementById('busca-paciente');
  if (busca) busca.addEventListener('input', renderPacientes);
});

// ============================================
// UTILITÁRIOS
// ============================================
function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function mostrarErro(formId, msg) {
  const form = document.getElementById(formId);
  let erro = form.querySelector('.form-error');
  if (!erro) {
    erro = document.createElement('p');
    erro.className = 'form-error';
    form.appendChild(erro);
  }
  erro.textContent = msg;
  setTimeout(() => { if (erro) erro.textContent = ''; }, 4000);
}

// FIX: confirmarAcao reescrita sem memory leak de event listeners
// Usa AbortController para remover listeners automaticamente após uso
function confirmarAcao(mensagem) {
  return new Promise(resolve => {
    const modal = document.getElementById('modal-confirmar');
    document.getElementById('confirmar-msg').innerHTML = mensagem;
    modal.style.display = 'flex';

    const controller = new AbortController();
    const { signal } = controller;

    const cleanup = (result) => {
      modal.style.display = 'none';
      controller.abort(); // remove todos os listeners de uma vez
      resolve(result);
    };

    document.getElementById('confirmar-sim').addEventListener('click', () => cleanup(true), { signal });
    document.getElementById('confirmar-nao').addEventListener('click', () => cleanup(false), { signal });
    modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(false); }, { signal });
  });
}
