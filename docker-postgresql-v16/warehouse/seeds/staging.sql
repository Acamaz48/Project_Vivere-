-- =====================================================
-- Seeds para Warehouse Service (ambiente staging)
-- =====================================================
-- Popula: categories, items, bom com dados fictícios para staging.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Categorias (iguais às do development)
-- =====================================================
INSERT INTO categories (id, name, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Treliças', NOW(), NOW()),
  (gen_random_uuid(), 'Pisos', NOW(), NOW()),
  (gen_random_uuid(), 'Travessas', NOW(), NOW()),
  (gen_random_uuid(), 'Acessórios', NOW(), NOW()),
  (gen_random_uuid(), 'Tendas', NOW(), NOW()),
  (gen_random_uuid(), 'Palcos', NOW(), NOW()),
  (gen_random_uuid(), 'Galpões', NOW(), NOW());

-- =====================================================
-- 2. Itens (versão simplificada para staging)
-- =====================================================
INSERT INTO items (id, sku, name, unit, width_mm, height_mm, length_mm, weight_kg, category_id, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  sku,
  name,
  unit::unit,
  width,
  height,
  length,
  weight,
  (SELECT id FROM categories WHERE name = cat),
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('TRELI-5M-STG', 'Treliça 5m staging', 'Treliças', 'un', 100, 100, 5000, 15.5),
  ('TRELI-3M-STG', 'Treliça 3m staging', 'Treliças', 'un', 100, 100, 3000, 9.8),
  ('PISO-125-STG', 'Piso 1,25 staging',  'Pisos', 'm2', 1250, 1250, 1250, 25.0),
  ('TRAV-2.5-STG', 'Travessa 2,5m staging','Travessas','un',50,50,2500,8.0),
  ('CUBO-STG',     'Cubo staging',       'Acessórios','un',200,200,200,2.5),
  ('PARAFUSO-STG', 'Parafuso staging',   'Acessórios','un',0,0,0,0.05),
  ('TENDA-3X3-STG','Tenda 3x3 staging',  'Tendas', 'kit',3000,3000,3000,50.0),
  ('PALCO-6X6-STG','Palco 6x6 staging',  'Palcos', 'kit',6000,6000,6000,500.0)
) AS t(sku, name, cat, unit, width, height, length, weight);

-- =====================================================
-- 3. BOM (exemplo: Tenda 3x3 staging)
-- =====================================================
WITH tenda AS (SELECT id FROM items WHERE sku = 'TENDA-3X3-STG')
INSERT INTO bom (id, parent_item_id, child_item_id, quantity, is_optional, version_id, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenda),
  i.id,
  qty,
  false,
  1,
  NOW(),
  NOW()
FROM (VALUES
  ('TRELI-5M-STG', 4),
  ('TRELI-3M-STG', 4),
  ('CUBO-STG',     4),
  ('PARAFUSO-STG', 50)
) AS t(sku, qty)
JOIN items i ON i.sku = t.sku;

-- =====================================================
-- Fim dos seeds para Warehouse Service (staging)
-- =====================================================