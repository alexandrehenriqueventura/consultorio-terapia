# Backend

Diretório do backend da aplicação de gerenciamento de consultório de terapia psicológica.

## Estrutura

Este diretório contém toda a lógica do servidor, APIs e serviços backend.

```
backend/
├── config/           # Configurações do banco de dados
├── controllers/      # Controllers (lógica de negócio)
├── models/          # Modelos de dados
├── routes/          # Rotas da API REST
├── server.js        # Arquivo principal do servidor
└── README.md        # Este arquivo
```

## Tecnologias

- Node.js
- Express.js
- PostgreSQL (Railway) - Migração completa de MySQL para PostgreSQL
- Biblioteca `pg` para conexão com PostgreSQL
- CORS, Helmet, Rate Limiting para segurança
- dotenv para variáveis de ambiente

## Banco de Dados

O backend está configurado para usar **PostgreSQL hospedado no Railway**. A conexão é feita através da biblioteca `pg` com as seguintes características:

- Pool de conexões para melhor performance
- SSL habilitado para conexões em produção
- Queries parametrizadas para prevenção de SQL injection
- Suporte a variável de ambiente `DATABASE_URL` (formato Railway)

## API REST - Rotas de Pacientes

As rotas REST para gerenciamento de pacientes estão disponíveis em `/api/pacientes`:

### Endpoints Disponíveis:

- **POST /api/pacientes** - Criar novo paciente
  - Body: `{ nome, cpf, data_nascimento, telefone, email, endereco }`
  
- **GET /api/pacientes** - Listar todos os pacientes
  
- **GET /api/pacientes/:id** - Buscar paciente por ID
  
- **PUT /api/pacientes/:id** - Atualizar paciente
  - Body: `{ nome, cpf, data_nascimento, telefone, email, endereco }`
  
- **DELETE /api/pacientes/:id** - Deletar paciente (soft delete)

### Health Check

- **GET /health** - Verifica o status do servidor

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório backend com as seguintes variáveis:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

Para Railway, a variável `DATABASE_URL` é fornecida automaticamente.

## Instalação

```bash
npm install
```

## Execução

### Modo desenvolvimento
```bash
npm run dev
```

### Modo produção
```bash
npm start
```

## Integração com Frontend

O backend está preparado para integração com o frontend através das rotas REST. O CORS está configurado para aceitar requisições do frontend (configurável via `FRONTEND_URL`).

### Exemplo de uso no Frontend:

```javascript
// Listar todos os pacientes
fetch('http://localhost:3000/api/pacientes')
  .then(res => res.json())
  .then(data => console.log(data));

// Criar novo paciente
fetch('http://localhost:3000/api/pacientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'João Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'joao@example.com'
  })
});
```

## Testes

Para testar a conexão com o banco de dados, inicie o servidor e verifique os logs de conexão.

```bash
npm start
```

Deve aparecer:
```
🚀 Servidor rodando na porta 3000
🌐 Environment: development
✅ Conectado ao banco de dados PostgreSQL
```
