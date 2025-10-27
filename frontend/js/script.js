// Exemplo SPA JS básico para Dashboard e navegação
// Implemente mais funcionalidades conforme as rotas da sua API

document.addEventListener('DOMContentLoaded', function () {
  // Navegação SPA
  // Cadastro/lista/formulário de pacientes
  // Listagem de consultas
  // Controle financeiro
  // ...

  // Exemplo: Carregar pacientes
  fetch('/api/pacientes')
    .then(res => res.json())
    .then(data => {
      // Renderize lista de pacientes na tela
      console.log(data);
    });
});
