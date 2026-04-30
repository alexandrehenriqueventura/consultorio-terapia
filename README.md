# Consultório L'amour Psique 🧠

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black) ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## 📋 Sobre o Projeto

Aplicação web **PWA** para **gerenciamento completo de consultório de terapia psicológica**, desenvolvida com HTML5 + JavaScript puro e Firebase como backend. Permite controlar pacientes, agendar e registrar consultas, acompanhar pagamentos e visualizar métricas financeiras em um dashboard em tempo real.

O projeto foi criado para atender à necessidade de um sistema leve, acessível em qualquer dispositivo (inclusive offline via Service Worker), sem depender de frameworks pesados — tudo rodando diretamente no navegador, com dados sincronizados em nuvem via Firebase.

## ✨ Funcionalidades

### 📊 Dashboard

- **Métricas em tempo real**: Total de pacientes cadastrados, consultas do mês corrente, receita pendente e pagamentos já recebidos
- **Atualização automática**: Os cards se atualizam a cada alteração realizada no sistema, sem necessidade de recarregar a página

### 👥 Gestão de Pacientes

- **Cadastro completo**: Nome, CPF, data de nascimento, telefone, e-mail, profissão e contato de emergência
- **Busca em tempo real**: Filtragem instantânea por nome ou e-mail
- **Edição e exclusão**: Confirmação antes de remover qualquer registro
- **Paginação**: Listagem organizada para grandes volumes de pacientes

### 🗓️ Gestão de Consultas

- **Agendamento**: Vincula consulta ao paciente cadastrado com data, hora e valor
- **Observações**: Campo livre para anotações clínicas por sessão
- **Controle financeiro**: Marcação de pagamento pendente ou recebido diretamente na lista
- **Exclusão com confirmação**: Modal de segurança para evitar remoções acidentais

### 🔐 Autenticação

- **Login seguro** via Firebase Authentication (email e senha)
- **Sessão persistente**: O usuário permanece autenticado entre visitas
- **Proteção de rotas**: Toda a aplicação fica oculta até a autenticação ser concluída

### 📱 PWA — Progressive Web App

- **Instalável**: Pode ser adicionado à tela inicial em Android, iOS e desktop como app nativo
- **Service Worker**: Cache de assets para uso offline ou com conexão instável
- **Manifest configurado**: Ícone, nome e tema personalizados

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| **HTML5 + CSS3 + JS** | Frontend completo sem framework |
| **Firebase Authentication** | Login e controle de sessão |
| **Cloud Firestore** | Banco de dados em tempo real |
| **Firebase Hosting** | Hospedagem estática com CDN global |
| **Service Worker** | Cache offline e instalação PWA |
| **Font Awesome 6** | Ícones da interface |

## 🚀 Deploy

O deploy é feito **automaticamente** via GitHub Actions sempre que há push na branch `main`.

O workflow realiza:
1. Checkout do repositório
2. Deploy do diretório `frontend/` para o **Firebase Hosting**

> O projeto está disponível em: `https://consultorio-terapia.web.app`

## ⚙️ Como Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/alexandrehenriqueventura/consultorio-terapia.git

# Acesse o diretório frontend
cd consultorio-terapia/frontend

# Sirva com qualquer servidor estático, por exemplo:
npx serve .
# ou
python -m http.server 8080
```

> **Atenção**: A aplicação usa os módulos ES do Firebase via CDN. É necessário servir os arquivos por um servidor HTTP (não abrir `index.html` diretamente pelo sistema de arquivos).

## 🔑 Configuração do Firebase

As credenciais do Firebase estão declaradas em `frontend/index.html`. Para um ambiente de produção próprio:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative **Authentication** (método: Email/Senha) e **Firestore**
3. Substitua o objeto `firebaseConfig` no `index.html` pelas suas credenciais
4. Configure o secret `FIREBASE_TOKEN` no repositório GitHub para o deploy automático funcionar

## 📁 Estrutura do Projeto

```
consultorio-terapia/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions — deploy automático
├── frontend/
│   ├── index.html           # Aplicação completa (SPA)
│   ├── manifest.json        # Configuração PWA
│   ├── sw.js                # Service Worker
│   ├── css/                 # Estilos externos
│   └── js/
│       └── script.js        # Lógica de pacientes, consultas e dashboard
├── firebase.json            # Configuração Firebase Hosting
└── .firebaserc              # Alias do projeto Firebase
```

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
