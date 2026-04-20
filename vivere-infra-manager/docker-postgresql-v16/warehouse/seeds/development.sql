-- =====================================================
-- Seeds para Warehouse Service (ambiente development)
-- =====================================================
-- Popula: categories, items, bom
-- Baseado nas planilhas de Treliçado, Galpão, Palco, Tendas
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. Categorias
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
-- 2. Itens (materiais) - baseado nas planilhas
-- =====================================================
-- Treliças
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
  ('TRELI-5M-ALT', 'Treliça 5m altura', 'Treliças', 'un', 100, 100, 5000, 15.5),
  ('TRELI-4M',     'Treliça 4m',        'Treliças', 'un', 100, 100, 4000, 12.2),
  ('TRELI-3M',     'Treliça 3m',        'Treliças', 'un', 100, 100, 3000, 9.8),
  ('TRELI-2M',     'Treliça 2m',        'Treliças', 'un', 100, 100, 2000, 6.5),
  ('TRELI-1M',     'Treliça 1m',        'Treliças', 'un', 100, 100, 1000, 3.2),
  ('TRELI-40CM',   'Treliça 40cm',      'Treliças', 'un', 100, 100, 400,  1.5),
  ('TRELI-30CM',   'Treliça 30cm',      'Treliças', 'un', 100, 100, 300,  1.2)
) AS t(sku, name, cat, unit, width, height, length, weight);

-- Pisos e travessas
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
  ('PISO-125X125',   'Piso 1,25 x 1,25', 'Pisos', 'm2', 1250, 1250, 1250, 25.0),
  ('TRAV-2.5M',      'Travessa 2,5m',    'Travessas', 'un', 50, 50, 2500, 8.0),
  ('TRAV-1.25M',     'Travessa 1,25m',   'Travessas', 'un', 50, 50, 1250, 4.0)
) AS t(sku, name, cat, unit, width, height, length, weight);

-- Acessórios
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
  (SELECT id FROM categories WHERE name = 'Acessórios'),
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('CUBO',          'Cubo',              'un', 200, 200, 200, 2.5),
  ('TALHA',         'Talha',             'un', 150, 150, 150, 1.8),
  ('SLEEVE',        'Sleeve',            'un', 100, 100, 100, 0.5),
  ('BASE',          'Base',              'un', 300, 100, 300, 5.0),
  ('PAU-CARGA',     'Pau de carga',      'un', 50,  50, 2000, 3.0),
  ('CINTA-CARGA',   'Cinta de carga',    'un', 0,   0,  0,   0.2),
  ('PARAFUSO',      'Parafuso',          'un', 0,   0,  0,   0.05),
  ('CACHORRO-CANTO-3X3', 'Cachorro canto 3x3', 'un', 500, 500, 500, 5.0),
  ('ESCADA-3M',     'Escada 3m',         'un', 600, 600, 3000, 12.0),
  ('ESTRELA-3X3',   'Estrela 3x3',       'un', 400, 400, 400, 3.0),
  ('LONA-3X3',      'Lona 3x3',          'un', 3000,3000,0,   5.0),
  ('PE-2.5M',       'Pé 2,5m',           'un', 100, 100, 2500, 8.0),
  ('VARA-3X3',      'Vara 3x3',          'un', 50,  50,  3000, 4.0)
) AS t(sku, name, unit, width, height, length, weight);

-- Tendas (itens compostos)
INSERT INTO items (id, sku, name, unit, width_mm, height_mm, length_mm, weight_kg, category_id, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  sku,
  name,
  'kit'::unit,
  width,
  height,
  length,
  weight,
  (SELECT id FROM categories WHERE name = 'Tendas'),
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('TENDA-3X3', 'Tenda 3x3 (somente teto)', 3000, 3000, 3000, 50.0),
  ('TENDA-4X4', 'Tenda 4x4 (somente teto)', 4000, 4000, 4000, 70.0),
  ('TENDA-5X5', 'Tenda 5x5 (somente teto)', 5000, 5000, 5000, 90.0),
  ('TENDA-6X6', 'Tenda 6x6 (somente teto)', 6000, 6000, 6000, 110.0),
  ('TENDA-8X8', 'Tenda 8x8 (somente teto)', 8000, 8000, 8000, 150.0),
  ('TENDA-10X10', 'Tenda 10x10 (somente teto)', 10000, 10000, 10000, 200.0)
) AS t(sku, name, width, height, length, weight);

-- Palcos
INSERT INTO items (id, sku, name, unit, width_mm, height_mm, length_mm, weight_kg, category_id, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  sku,
  name,
  'kit'::unit,
  width,
  height,
  length,
  weight,
  (SELECT id FROM categories WHERE name = 'Palcos'),
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('PALCO-6X6',   'Palco 6x6',   6000, 6000, 6000, 500.0),
  ('PALCO-8X8',   'Palco 8x8',   8000, 8000, 8000, 800.0),
  ('PALCO-9X6',   'Palco 9x6',   9000, 6000, 9000, 700.0),
  ('PALCO-10X8',  'Palco 10x8',  10000,8000, 10000,900.0),
  ('PALCO-12X10', 'Palco 12x10', 12000,10000,12000,1200.0)
) AS t(sku, name, width, height, length, weight);

-- Galpões
INSERT INTO items (id, sku, name, unit, width_mm, height_mm, length_mm, weight_kg, category_id, is_active, created_at, updated_at)
SELECT
  gen_random_uuid(),
  sku,
  name,
  'kit'::unit,
  width,
  height,
  length,
  weight,
  (SELECT id FROM categories WHERE name = 'Galpões'),
  true,
  NOW(),
  NOW()
FROM (VALUES
  ('GALPAO-10X10-3M', 'Galpão 10x10 com 3m altura', 10000, 3000, 10000, 2000.0),
  ('GALPAO-10X10-4M', 'Galpão 10x10 com 4m altura', 10000, 4000, 10000, 2200.0)
) AS t(sku, name, width, height, length, weight);

-- =====================================================
-- 3. BOM (Bill of Materials) - Estruturas
-- =====================================================
-- Exemplo: Tenda 3x3
WITH tenda3x3 AS (SELECT id FROM items WHERE sku = 'TENDA-3X3')
INSERT INTO bom (id, parent_item_id, child_item_id, quantity, is_optional, version_id, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenda3x3),
  i.id,
  qty,
  false,
  1,
  NOW(),
  NOW()
FROM (VALUES
  ('TRELI-5M-ALT', 4),
  ('TRELI-2M',     4),
  ('TRELI-40CM',   4),
  ('TRELI-30CM',   4),
  ('CUBO',         4),
  ('TALHA',        4),
  ('SLEEVE',       4),
  ('BASE',         4),
  ('PAU-CARGA',    4),
  ('CINTA-CARGA',  4),
  ('PARAFUSO',    120),
  ('TRELI-1M',     2)
) AS t(sku, qty)
JOIN items i ON i.sku = t.sku;

-- Exemplo: Tenda 4x4
WITH tenda4x4 AS (SELECT id FROM items WHERE sku = 'TENDA-4X4')
INSERT INTO bom (id, parent_item_id, child_item_id, quantity, is_optional, version_id, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM tenda4x4),
  i.id,
  qty,
  false,
  1,
  NOW(),
  NOW()
FROM (VALUES
  ('TRELI-5M-ALT', 4),
  ('TRELI-3M',     4),
  ('TRELI-40CM',   4),
  ('TRELI-30CM',   4),
  ('CUBO',         4),
  ('TALHA',        4),
  ('SLEEVE',       4),
  ('BASE',         4),
  ('PAU-CARGA',    4),
  ('CINTA-CARGA',  4),
  ('PARAFUSO',    120),
  ('TRELI-1M',     2)
) AS t(sku, qty)
JOIN items i ON i.sku = t.sku;

-- Nota: Você pode continuar adicionando BOMs para outras tendas, palcos, galpões
-- seguindo o mesmo padrão.

-- =====================================================
-- Fim dos seeds para Warehouse Service
-- =====================================================