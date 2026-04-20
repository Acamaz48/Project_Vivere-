-- =====================================================
-- Seeds para Identity Service (ambiente staging)
-- =====================================================
-- Popula: organizations, persons, organization_persons,
-- addresses, consents com dados fictícios para staging.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Organizações
-- =====================================================
INSERT INTO organizations (id, legal_name, trade_name, tax_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Eventos Staging Ltda', 'Staging Eventos', '11111111000199', NOW(), NOW()),
  (gen_random_uuid(), 'Fornecedor Staging ME', 'Staging Fornece', '22222222000188', NOW(), NOW()),
  (gen_random_uuid(), 'Prefeitura Staging', 'Prefeitura Teste', '33333333000155', NOW(), NOW());

-- =====================================================
-- 2. Pessoas físicas
-- =====================================================
INSERT INTO persons (id, full_name, tax_id, birth_date, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Roberto Staging', '11111111111', '1980-01-01', NOW(), NOW()),
  (gen_random_uuid(), 'Fernanda Staging', '22222222222', '1985-02-02', NOW(), NOW()),
  (gen_random_uuid(), 'Lucas Staging', '33333333333', '1975-03-03', NOW(), NOW()),
  (gen_random_uuid(), 'Juliana Staging', '44444444444', '1990-04-04', NOW(), NOW()),
  (gen_random_uuid(), 'Marcos Staging', '55555555555', '1982-05-05', NOW(), NOW());

-- =====================================================
-- 3. Vínculos
-- =====================================================
INSERT INTO organization_persons (organization_id, person_id, role, start_date, end_date, created_at)
SELECT o.id, p.id, 'FUNCIONARIO', '2021-01-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Eventos Staging Ltda' AND p.full_name = 'Roberto Staging'
UNION ALL
SELECT o.id, p.id, 'REPRESENTANTE', '2022-02-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Fornecedor Staging ME' AND p.full_name = 'Fernanda Staging'
UNION ALL
SELECT o.id, p.id, 'CONTATO', '2023-03-01', NULL, NOW()
FROM organizations o, persons p
WHERE o.legal_name = 'Prefeitura Staging' AND p.full_name = 'Lucas Staging';

-- =====================================================
-- 4. Endereços
-- =====================================================
INSERT INTO addresses (id, organization_id, person_id, street, number, complement, neighborhood, zip_code, city, state, country, is_primary, created_at, updated_at)
SELECT
  gen_random_uuid(),
  o.id,
  NULL,
  'Av. Staging',
  '1000',
  'Andar 5',
  'Centro',
  '01010-010',
  'São Paulo',
  'SP',
  'Brasil',
  true,
  NOW(),
  NOW()
FROM organizations o WHERE o.legal_name = 'Eventos Staging Ltda'
UNION ALL
SELECT
  gen_random_uuid(),
  NULL,
  p.id,
  'Rua Teste',
  '123',
  'Casa',
  'Jardim',
  '02020-020',
  'São Paulo',
  'SP',
  'Brasil',
  true,
  NOW(),
  NOW()
FROM persons p WHERE p.full_name = 'Roberto Staging';

-- =====================================================
-- 5. Consentimentos
-- =====================================================
INSERT INTO consents (id, person_id, purpose, is_granted, ip_address, user_agent, valid_until, created_at)
SELECT
  gen_random_uuid(),
  p.id,
  'MARKETING',
  true,
  '10.0.0.1',
  'Mozilla/5.0 (staging)',
  NOW() + interval '1 year',
  NOW()
FROM persons p WHERE p.full_name = 'Roberto Staging'
UNION ALL
SELECT
  gen_random_uuid(),
  p.id,
  'EXECUCAO_CONTRATO',
  true,
  '10.0.0.2',
  'Mozilla/5.0 (staging)',
  NULL,
  NOW()
FROM persons p WHERE p.full_name = 'Fernanda Staging';

-- =====================================================
-- Fim dos seeds para Identity Service (staging)
-- =====================================================