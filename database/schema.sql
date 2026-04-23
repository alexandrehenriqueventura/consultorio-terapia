-- Sistema de Gerenciamento de Consultório de Terapia
-- Banco de dados: PostgreSQL

-- Tabela de Usuários (autenticação)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Pacientes
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco_logradouro VARCHAR(255),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_cep VARCHAR(10),
    endereco_estado VARCHAR(2),
    profissao VARCHAR(100),
    estado_civil VARCHAR(50),
    contato_emergencia_nome VARCHAR(255),
    contato_emergencia_telefone VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Informações de Pagamento
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    valor_sessao DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    dia_vencimento INTEGER,
    observacoes_pagamento TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de Consultas
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    data_consulta DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    status VARCHAR(50) DEFAULT 'agendado',
    valor_cobrado DECIMAL(10,2),
    foi_pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Observações Clínicas
CREATE TABLE observacoes_clinicas (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE CASCADE,
    consulta_id INTEGER REFERENCES consultas(id) ON DELETE SET NULL,
    data_observacao DATE NOT NULL,
    observacao TEXT NOT NULL,
    categoria VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_consultas_data ON consultas(data_consulta);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
