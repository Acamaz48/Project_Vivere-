-- =====================================================
-- Seeds para Service Order Service (ambiente staging)
-- =====================================================
-- Popula: orders, order_items com dados fictícios para staging.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  cliente_org_id UUID;
  fornecedor_id UUID;
  item_tenda_id UUID;
  item_trelica_id UUID;
  item_parafuso_id UUID;
  usuario_admin_id UUID;
BEGIN
  -- Obtém IDs do identity (staging)
  SELECT id INTO cliente_org_id FROM organizations WHERE legal_name = 'Eventos Staging Ltda';
  SELECT id INTO fornecedor_id FROM organizations WHERE legal_name = 'Fornecedor Staging ME';

  -- Obtém IDs de itens do warehouse (staging)
  SELECT id INTO item_tenda_id FROM items WHERE sku = 'TENDA-3X3-STG';
  SELECT id INTO item_trelica_id FROM items WHERE sku = 'TRELI-5M-STG';
  SELECT id INTO item_parafuso_id FROM items WHERE sku = 'PARAFUSO-STG';

  -- Obtém ID do usuário admin (staging)
  SELECT id INTO usuario_admin_id FROM users WHERE email = 'admin.staging@eventos.com';

  -- =====================================================
  -- Ordem 1
  -- =====================================================
  INSERT INTO orders (id, code, customer_type, customer_id, status, total_value, currency, notes,
                      event_name, event_location, event_start, event_end,
                      assembly_start, assembly_deadline, disassembly_start,
                      onsite_responsible_name, notes_montagem,
                      created_at, created_by, updated_at)
  VALUES (
    gen_random_uuid(), 'STG-2025-001', 'ORGANIZATION', cliente_org_id, 'CONFIRMED', 8000.00, 'BRL',
    'Evento de testes staging',
    'Teste Staging', 'Local Staging', '2025-09-01 10:00:00', '2025-09-01 22:00:00',
    '2025-08-31 08:00:00', '2025-09-01 08:00:00', '2025-09-02 08:00:00',
    'Responsável Staging', 'Observação staging',
    NOW(), usuario_admin_id, NOW()
  );

  INSERT INTO order_items (id, order_id, item_id, quantity, daily_unit_price, number_of_days, discount,
                           period_start, period_end, notes, created_at, created_by)
  SELECT gen_random_uuid(), o.id, item_tenda_id, 1, 400.00, 1, 0,
         '2025-09-01 10:00:00', '2025-09-01 22:00:00', 'Tenda staging', NOW(), usuario_admin_id
  FROM orders o WHERE o.code = 'STG-2025-001'
  UNION ALL
  SELECT gen_random_uuid(), o.id, item_trelica_id, 5, 30.00, 1, 0,
         '2025-09-01 10:00:00', '2025-09-01 22:00:00', 'Treliças staging', NOW(), usuario_admin_id
  FROM orders o WHERE o.code = 'STG-2025-001';

  -- =====================================================
  -- Ordem 2 com item de terceiro
  -- =====================================================
  INSERT INTO orders (id, code, customer_type, customer_id, status, total_value, currency, notes,
                      event_name, event_location, event_start, event_end,
                      assembly_start, assembly_deadline, disassembly_start,
                      onsite_responsible_name, notes_montagem,
                      created_at, created_by, updated_at)
  VALUES (
    gen_random_uuid(), 'STG-2025-002', 'ORGANIZATION', cliente_org_id, 'DRAFT', 1500.00, 'BRL',
    'Evento com item de terceiro',
    'Teste Terceiro', 'Local Staging', '2025-10-01 14:00:00', '2025-10-01 20:00:00',
    '2025-09-30 09:00:00', '2025-10-01 12:00:00', '2025-10-02 09:00:00',
    'Responsável', 'Observação',
    NOW(), usuario_admin_id, NOW()
  );

  INSERT INTO order_items (id, order_id, item_id, supplier_id, supplier_item_description, supplier_order_ref, cost_price,
                           quantity, daily_unit_price, number_of_days, discount,
                           period_start, period_end, notes, created_at, created_by)
  SELECT gen_random_uuid(), o.id, NULL, fornecedor_id, 'Cadeira plástica staging', 'FOR-STG-001', 3.00,
         20, 5.00, 1, 0,
         '2025-10-01 14:00:00', '2025-10-01 20:00:00', 'Cadeiras staging', NOW(), usuario_admin_id
  FROM orders o WHERE o.code = 'STG-2025-002';

END $$;