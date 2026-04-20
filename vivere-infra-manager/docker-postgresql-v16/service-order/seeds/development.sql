-- =====================================================
-- Seeds para Service Order Service (ambiente development)
-- =====================================================
-- Popula: orders, order_items
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  cliente_org_id UUID;
  cliente_pessoa_id UUID;
  fornecedor_id UUID;
  item_tenda_id UUID;
  item_trelica_id UUID;
  item_parafuso_id UUID;
  usuario_admin_id UUID;
  usuario_gerente_id UUID;
BEGIN
  -- Obtém IDs de organizações e pessoas do identity_db (por nome)
  SELECT id INTO cliente_org_id FROM organizations WHERE legal_name = 'Empresa de Eventos Show Ltda';
  SELECT id INTO cliente_pessoa_id FROM persons WHERE full_name = 'João da Silva';
  SELECT id INTO fornecedor_id FROM organizations WHERE legal_name = 'Fornecedora de Estruturas ME';

  -- Obtém IDs de itens do warehouse_db (por SKU)
  SELECT id INTO item_tenda_id FROM items WHERE sku = 'TENDA-3X3';
  SELECT id INTO item_trelica_id FROM items WHERE sku = 'TRELI-5M-ALT';
  SELECT id INTO item_parafuso_id FROM items WHERE sku = 'PARAFUSO';

  -- Obtém IDs de usuários do auth_db (por email) – referências lógicas
  SELECT id INTO usuario_admin_id FROM users WHERE email = 'admin@eventos.com';
  SELECT id INTO usuario_gerente_id FROM users WHERE email = 'gerente@eventos.com';

  -- =====================================================
  -- Ordem 1: Evento particular (cliente pessoa)
  -- =====================================================
  INSERT INTO orders (id, code, customer_type, customer_id, status, total_value, currency, notes,
                      event_name, event_location, event_start, event_end,
                      assembly_start, assembly_deadline, disassembly_start,
                      onsite_responsible_name, notes_montagem,
                      created_at, created_by, updated_at)
  VALUES (
    gen_random_uuid(), 'OS-2025-001', 'PERSON', cliente_pessoa_id, 'CONFIRMED', 12500.00, 'BRL',
    'Evento corporativo - Festa junina',
    'Festa Junina da Empresa', 'Parque da Cidade', '2025-06-15 18:00:00', '2025-06-16 02:00:00',
    '2025-06-14 08:00:00', '2025-06-14 16:00:00', '2025-06-16 08:00:00',
    'João (responsável local)', 'Montar palco e tenda principal',
    NOW(), usuario_admin_id, NOW()
  );

  -- Itens da OS-001
  INSERT INTO order_items (id, order_id, item_id, quantity, daily_unit_price, number_of_days, discount,
                           period_start, period_end, notes, created_at, created_by)
  SELECT gen_random_uuid(), o.id, item_tenda_id, 2, 500.00, 1, 0,
         '2025-06-15 18:00:00', '2025-06-16 02:00:00', 'Tenda 3x3 para barracas', NOW(), usuario_admin_id
  FROM orders o WHERE o.code = 'OS-2025-001'
  UNION ALL
  SELECT gen_random_uuid(), o.id, item_trelica_id, 10, 50.00, 1, 0,
         '2025-06-15 18:00:00', '2025-06-16 02:00:00', 'Treliças extras', NOW(), usuario_admin_id
  FROM orders o WHERE o.code = 'OS-2025-001';

  -- =====================================================
  -- Ordem 2: Evento público (cliente organização) com item de terceiro
  -- =====================================================
  INSERT INTO orders (id, code, customer_type, customer_id, status, total_value, currency, notes,
                      event_name, event_location, event_start, event_end,
                      assembly_start, assembly_deadline, disassembly_start,
                      onsite_responsible_name, notes_montagem,
                      created_at, created_by, updated_at)
  VALUES (
    gen_random_uuid(), 'OS-2025-002', 'ORGANIZATION', cliente_org_id, 'DRAFT', 3500.00, 'BRL',
    'Show de aniversário da cidade',
    'Show da Cidade', 'Praça Central', '2025-07-20 20:00:00', '2025-07-21 00:00:00',
    '2025-07-19 10:00:00', '2025-07-20 16:00:00', '2025-07-21 08:00:00',
    'Coordenador da praça', 'Palco principal com som',
    NOW(), usuario_gerente_id, NOW()
  );

  -- Item próprio (parafusos)
  INSERT INTO order_items (id, order_id, item_id, supplier_id, supplier_item_description, supplier_order_ref, cost_price,
                           quantity, daily_unit_price, number_of_days, discount,
                           period_start, period_end, notes, created_at, created_by)
  SELECT gen_random_uuid(), o.id, item_parafuso_id, NULL, NULL, NULL, NULL,
         500, 0.10, 2, 0,
         '2025-07-20 20:00:00', '2025-07-21 00:00:00', 'Parafusos para montagem', NOW(), usuario_gerente_id
  FROM orders o WHERE o.code = 'OS-2025-002'
  UNION ALL
  -- Item de terceiro (cadeiras alugadas)
  SELECT gen_random_uuid(), o.id, NULL, fornecedor_id, 'Cadeira plástica branca', 'FOR-2025-001', 5.00,
         100, 2.50, 2, 0,
         '2025-07-20 20:00:00', '2025-07-21 00:00:00', 'Cadeiras alugadas', NOW(), usuario_gerente_id
  FROM orders o WHERE o.code = 'OS-2025-002';

END $$;