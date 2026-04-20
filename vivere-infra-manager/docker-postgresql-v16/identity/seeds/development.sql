-- =====================================================
-- Seeds para Identity Service (ambiente development)
-- =====================================================
-- Popula: organizations, persons, organization_persons,
-- addresses, consents.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Organizações (empresas, órgãos públicos)
-- =====================================================
INSERT INTO organizations (id, legal_name, trade_name, tax_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Empresa de Eventos Show Ltda', 'Show Eventos', '12345678000199', NOW(), NOW()),
  (gen_random_uuid(), 'Fornecedora de Estruturas ME', 'Estruturas Rápidas', '98765432000188', NOW(), NOW()),
  (gen_random_uuid(), 'Secretaria de Cultura Municipal', 'Cultura Cidade', '11222333000155', NOW(), NOW());

-- =====================================================
-- 2. Pessoas físicas
-- =====================================================
INSERT INTO persons (id, full_name, tax_id, birth_date, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'João da Silva', '12345678901', '1980-05-15', NOW(), NOW()),
  (gen_random_uuid(), 'Maria Oliveira', '23456789012', '1985-10-20', NOW(), NOW()),
  (gen_random_uuid(), 'Carlos Pereira', '34567890123', '1975-03-10', NOW(), NOW()),
  (gen_random_uuid(), 'Ana Costa', '45678901234', '1990-07-25', NOW(), NOW()),
  (gen_random_uuid(), 'Pedro Santos', '56789012345', '1982-12-01', NOW(), NOW());

-- =====================================================
-- 3. Vínculos entre pessoas e organizações
-- =====================================================
-- Funcionário da Show Eventos
INSERT INTO organization_persons (organization_id, person_id, role, start_date, end_date, created_at)
SELECT o.id, p.id, 'FUNCIONARIO', '2020-01-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Empresa de Eventos Show Ltda' AND p.full_name = 'João da Silva';

-- Representante da Estruturas Rápidas
INSERT INTO organization_persons (organization_id, person_id, role, start_date, end_date, created_at)
SELECT o.id, p.id, 'REPRESENTANTE', '2021-06-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Fornecedora de Estruturas ME' AND p.full_name = 'Maria Oliveira';

-- Contato na Secretaria de Cultura
INSERT INTO organization_persons (organization_id, person_id, role, start_date, end_date, created_at)
SELECT o.id, p.id, 'CONTATO', '2022-03-15', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Secretaria de Cultura Municipal' AND p.full_name = 'Carlos Pereira';

-- Outros vínculos (opcional)
INSERT INTO organization_persons (organization_id, person_id, role, start_date, end_date, created_at)
SELECT o.id, p.id, 'FUNCIONARIO', '2019-11-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Empresa de Eventos Show Ltda' AND p.full_name = 'Ana Costa'
UNION ALL
SELECT o.id, p.id, 'FUNCIONARIO', '2020-08-15', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Fornecedora de Estruturas ME' AND p.full_name = 'Pedro Santos';

-- =====================================================
-- 4. Endereços
-- =====================================================
-- Endereço da organização Show Eventos
INSERT INTO addresses (id, organization_id, person_id, street, number, complement, neighborhood, zip_code, city, state, country, is_primary, created_at, updated_at)
SELECT
  gen_random_uuid(),
  o.id,
  NULL,
  'Av. Paulista',
  '1000',
  'Sala 101',
  'Bela Vista',
  '01310-100',
  'São Paulo',
  'SP',
  'Brasil',
  true,
  NOW(),
  NOW()
FROM organizations o WHERE o.legal_name = 'Empresa de Eventos Show Ltda';

-- Endereço residencial de João da Silva
INSERT INTO addresses (id, organization_id, person_id, street, number, complement, neighborhood, zip_code, city, state, country, is_primary, created_at, updated_at)
SELECT
  gen_random_uuid(),
  NULL,
  p.id,
  'Rua das Flores',
  '123',
  'Apto 45',
  'Jardim América',
  '01420-010',
  'São Paulo',
  'SP',
  'Brasil',
  true,
  NOW(),
  NOW()
FROM persons p WHERE p.full_name = 'João da Silva';

-- Endereço da Secretaria de Cultura
INSERT INTO addresses (id, organization_id, person_id, street, number, complement, neighborhood, zip_code, city, state, country, is_primary, created_at, updated_at)
SELECT
  gen_random_uuid(),
  o.id,
  NULL,
  'Praça da Sé',
  's/n',
  'Centro',
  'Sé',
  '01001-000',
  'São Paulo',
  'SP',
  'Brasil',
  true,
  NOW(),
  NOW()
FROM organizations o WHERE o.legal_name = 'Secretaria de Cultura Municipal';

-- =====================================================
-- 5. Consentimentos LGPD
-- =====================================================
-- Consentimento para marketing de João da Silva
INSERT INTO consents (id, person_id, purpose, is_granted, ip_address, user_agent, valid_until, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  'MARKETING',
  true,
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() + interval '1 year',
  NOW()
FROM persons p WHERE p.full_name = 'João da Silva';

-- Consentimento para execução de contrato de Maria Oliveira
INSERT INTO consents (id, person_id, purpose, is_granted, ip_address, user_agent, valid_until, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  'EXECUCAO_CONTRATO',
  true,
  '192.168.1.101',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  NULL,
  NOW()
FROM persons p WHERE p.full_name = 'Maria Oliveira';

-- =====================================================
-- Fim dos seeds para Identity Service
-- =====================================================