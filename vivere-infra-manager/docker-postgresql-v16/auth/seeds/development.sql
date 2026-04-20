-- =====================================================
-- Seeds para Auth Service (ambiente development)
-- =====================================================
-- Popula as tabelas: roles, users, user_roles, login_history
-- com dados fictícios para testes e homologação.
-- =====================================================

-- Habilita extensão para gerar UUIDs (já deve estar habilitada, mas garantimos)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Perfis de acesso (roles)
-- =====================================================
INSERT INTO roles (code, description, permissions, created_at, updated_at)
VALUES
  ('ADMIN', 'Administrador do sistema', '["user:read", "user:write", "role:assign", "order:all", "inventory:all"]'::jsonb, NOW(), NOW()),
  ('MANAGER', 'Gerente de eventos', '["order:read", "order:write", "inventory:read", "inventory:write"]'::jsonb, NOW(), NOW()),
  ('OPERATOR', 'Operador de estoque', '["inventory:read", "inventory:write", "movement:create"]'::jsonb, NOW(), NOW()),
  ('VIEWER', 'Apenas visualização', '["order:read", "inventory:read"]'::jsonb, NOW(), NOW());

-- =====================================================
-- 2. Usuários (credenciais)
-- =====================================================
-- As senhas aqui são hashes fictícios (exemplo: 'password123')
-- Em produção, use bcrypt com salt adequado.
INSERT INTO users (id, person_id, email, password_hash, is_active, requires_mfa, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'admin@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'gerente@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'operador@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'viewer@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW());

-- =====================================================
-- 3. Associação usuário-perfil
-- =====================================================
-- Atribui os papéis aos usuários (cada usuário recebe um papel)
INSERT INTO user_roles (user_id, role_code, assigned_at, assigned_by)
SELECT u.id, 'ADMIN', NOW(), u.id FROM users u WHERE u.email = 'admin@eventos.com'
UNION ALL
SELECT u.id, 'MANAGER', NOW(), u.id FROM users u WHERE u.email = 'gerente@eventos.com'
UNION ALL
SELECT u.id, 'OPERATOR', NOW(), u.id FROM users u WHERE u.email = 'operador@eventos.com'
UNION ALL
SELECT u.id, 'VIEWER', NOW(), u.id FROM users u WHERE u.email = 'viewer@eventos.com';

-- =====================================================
-- 4. Histórico de login (opcional)
-- =====================================================
-- Cria alguns registros de login para cada usuário
INSERT INTO login_history (id, user_id, login_at, ip_address, status, failure_reason)
SELECT
  gen_random_uuid(),
  u.id,
  NOW() - (random() * interval '30 days'),
  concat(floor(random()*255)::int, '.', floor(random()*255)::int, '.', floor(random()*255)::int, '.', floor(random()*255)::int),
  CASE WHEN random() > 0.1 THEN 'SUCCESS' ELSE 'FAILED' END,
  CASE WHEN random() <= 0.1 THEN 'Senha incorreta' ELSE NULL END
FROM users u, generate_series(1, 5) -- 5 logs por usuário
WHERE u.email IN ('admin@eventos.com', 'gerente@eventos.com', 'operador@eventos.com', 'viewer@eventos.com');

-- =====================================================
-- Fim dos seeds para Auth Service
-- =====================================================