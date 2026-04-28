-- =====================================================
-- Seeds para Auth Service (ambiente staging)
-- =====================================================
-- Popula as tabelas: roles, users, user_roles, login_history
-- com dados fictícios para testes em staging.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Perfis de acesso (roles) - mesmos do development
-- =====================================================
INSERT INTO roles (code, description, permissions, created_at, updated_at)
VALUES
  ('ADMIN', 'Administrador do sistema', '["user:read", "user:write", "role:assign", "order:all", "inventory:all"]'::jsonb, NOW(), NOW()),
  ('MANAGER', 'Gerente de eventos', '["order:read", "order:write", "inventory:read", "inventory:write"]'::jsonb, NOW(), NOW()),
  ('OPERATOR', 'Operador de estoque', '["inventory:read", "inventory:write", "movement:create"]'::jsonb, NOW(), NOW()),
  ('VIEWER', 'Apenas visualização', '["order:read", "inventory:read"]'::jsonb, NOW(), NOW());

-- =====================================================
-- 2. Usuários (credenciais) - diferentes do development
-- =====================================================
INSERT INTO users (id, person_id, email, password_hash, is_active, requires_mfa, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin.staging@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, true, NOW(), NOW()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'gerente.staging@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'operador.staging@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'viewer.staging@eventos.com', '$2a$10$X7VYx8fGhjKlMnBqWeRtYuIoPlAzSdFgHjKlMnBqWeRtYuIoPlA', true, false, NOW(), NOW());

-- =====================================================
-- 3. Associação usuário-perfil
-- =====================================================
INSERT INTO user_roles (user_id, role_code, assigned_at, assigned_by)
SELECT u.id, 'ADMIN', NOW(), u.id FROM users u WHERE u.email = 'admin.staging@eventos.com'
UNION ALL
SELECT u.id, 'MANAGER', NOW(), u.id FROM users u WHERE u.email = 'gerente.staging@eventos.com'
UNION ALL
SELECT u.id, 'OPERATOR', NOW(), u.id FROM users u WHERE u.email = 'operador.staging@eventos.com'
UNION ALL
SELECT u.id, 'VIEWER', NOW(), u.id FROM users u WHERE u.email = 'viewer.staging@eventos.com';

-- =====================================================
-- 4. Histórico de login (opcional)
-- =====================================================
INSERT INTO login_history (id, user_id, login_at, ip_address, status, failure_reason)
SELECT
  gen_random_uuid(),
  u.id,
  NOW() - (random() * interval '15 days'),
  concat(floor(random()*255)::int, '.', floor(random()*255)::int, '.', floor(random()*255)::int, '.', floor(random()*255)::int),
  CASE WHEN random() > 0.95 THEN 'FAILED' ELSE 'SUCCESS' END,
  CASE WHEN random() <= 0.05 THEN 'Senha incorreta' ELSE NULL END
FROM users u, generate_series(1, 3)
WHERE u.email LIKE '%.staging@eventos.com';

-- =====================================================
-- Fim dos seeds para Auth Service (staging)
-- =====================================================