// ============================================
// SISTEMA DE GERENCIAMENTO - FIREBASE FIRESTORE
// ============================================

import{collection,getDocs,addDoc,updateDoc,deleteDoc,doc,query,where,orderBy,getDoc}from'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

let currentUser=null;
let pacientesData=[];
let consultasData=[];

// ============================================
// INICIALIZACAO
// ============================================

window.loadApp=async function(){
  currentUser=window.auth.currentUser;
  if(!currentUser)return;
  
  // Verificar role admin
  const userDoc=await getDoc(doc(window.db,'users',currentUser.uid));
  if(!userDoc.exists()||userDoc.data().role!=='admin'){
    alert('⚠️ Acesso negado - somente administradores');
    window.auth.signOut();
    return;
  }
  
  setupTabs();
  await loadPacientes();
  await loadConsultas();
  updateDashboard();
};

// ============================================
// SISTEMA DE TABS
// ============================================

function setupTabs(){
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t=>t.style.display='none');
      document.getElementById(btn.dataset.tab+'-tab').style.display='block';
    });
  });
  
  document.getElementById('add-paciente-btn').addEventListener('click',showAddPacienteModal);
}

// ============================================
// PACIENTES - CRUD FIRESTORE
// ============================================

async function loadPacientes(){
  const q=query(collection(window.db,'pacientes'),where('ativo','==',true),orderBy('nome','asc'));
  const snapshot=await getDocs(q);
  pacientesData=snapshot.docs.map(d=>({id:d.id,...d.data()}));
  renderPacientes();
}

function renderPacientes(){
  const container=document.getElementById('pacientes-list');
  if(pacientesData.length===0){
    container.innerHTML='<p style="color:var(--muted);text-align:center;padding:40px">Nenhum paciente cadastrado</p>';
    return;
  }
  container.innerHTML=pacientesData.map(p=>`
    <div class="card" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0 0 4px;font-size:16px;color:#fff">${p.nome}</h3>
        <p style="margin:0;font-size:13px;color:var(--muted)">${p.telefone||'Sem telefone'} • ${p.email||'Sem email'}</p>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="editPaciente('${p.id}')" class="btn-primary" style="width:auto;padding:8px 16px;background:var(--primary)"><i class="fas fa-edit"></i> Editar</button>
        <button onclick="deletePaciente('${p.id}')" class="btn-primary" style="width:auto;padding:8px 16px;background:var(--danger)"><i class="fas fa-trash"></i> Excluir</button>
      </div>
    </div>
  `).join('');
}

window.editPaciente=async function(id){
  const paciente=pacientesData.find(p=>p.id===id);
  if(!paciente)return;
  const nome=prompt('Nome do paciente:',paciente.nome);
  if(!nome)return;
  const telefone=prompt('Telefone:',paciente.telefone||'');
  const email=prompt('Email:',paciente.email||'');
  await updateDoc(doc(window.db,'pacientes',id),{nome,telefone,email});
  await loadPacientes();
  updateDashboard();
};

window.deletePaciente=async function(id){
  if(!confirm('Excluir este paciente?'))return;
  await updateDoc(doc(window.db,'pacientes',id),{ativo:false});
  await loadPacientes();
  updateDashboard();
};

function showAddPacienteModal(){
  const nome=prompt('Nome do paciente:');
  if(!nome)return;
  const telefone=prompt('Telefone:');
  const email=prompt('Email:');
  addPaciente({nome,telefone,email,ativo:true,dataCadastro:new Date()});
}

async function addPaciente(data){
  await addDoc(collection(window.db,'pacientes'),data);
  await loadPacientes();
  updateDashboard();
}

// ============================================
// CONSULTAS - CRUD FIRESTORE
// ============================================

async function loadConsultas(){
  const q=query(collection(window.db,'consultas'),orderBy('data','desc'));
  const snapshot=await getDocs(q);
  consultasData=snapshot.docs.map(d=>({id:d.id,...d.data()}));
  renderConsultas();
}

function renderConsultas(){
  const container=document.getElementById('consultas-list');
  if(consultasData.length===0){
    container.innerHTML='<p style="color:var(--muted);text-align:center;padding:40px">Nenhuma consulta agendada</p>';
    return;
  }
  container.innerHTML=consultasData.slice(0,20).map(c=>{
    const paciente=pacientesData.find(p=>p.id===c.pacienteId)||{nome:'Paciente desconhecido'};
    const isPago=c.pago===true;
    return`
    <div class="card" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0 0 4px;font-size:16px;color:#fff">${paciente.nome}</h3>
        <p style="margin:0;font-size:13px;color:var(--muted)">${c.data?.toDate?c.data.toDate().toLocaleDateString('pt-BR'):c.data} • R$ ${c.valor||0}</p>
      </div>
      <div>
        ${isPago?'<span style="color:var(--ok);font-weight:600">✓ Pago</span>':`<button onclick="marcarPago('${c.id}')" class="btn-primary" style="width:auto;padding:8px 16px">Marcar como Pago</button>`}
      </div>
    </div>
  `}).join('');
}

window.marcarPago=async function(id){
  await updateDoc(doc(window.db,'consultas',id),{pago:true});
  await loadConsultas();
  updateDashboard();
};

// ============================================
// DASHBOARD - METRICAS
// ============================================

function updateDashboard(){
  document.getElementById('total-pacientes').textContent=pacientesData.length;
  const mesAtual=new Date().getMonth();
  const consultasMes=consultasData.filter(c=>{
    const d=c.data?.toDate?c.data.toDate():new Date(c.data);
    return d.getMonth()===mesAtual;
  });
  document.getElementById('total-consultas').textContent=consultasMes.length;
  const pendentes=consultasMes.filter(c=>!c.pago).reduce((sum,c)=>sum+(c.valor||0),0);
  const pagos=consultasMes.filter(c=>c.pago).reduce((sum,c)=>sum+(c.valor||0),0);
  document.getElementById('receita-pendente').textContent='R$ '+pendentes.toFixed(2);
  document.getElementById('pagos').textContent='R$ '+pagos.toFixed(2);
}
