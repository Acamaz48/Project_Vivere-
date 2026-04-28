-- =====================================================
-- Seeds para Logistics Service (ambiente staging)
-- =====================================================
-- Popula: addresses, locations, inventory, allocations, movements
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  warehouse_addr_id UUID;
  warehouse_loc_id UUID;
  event_loc_id UUID;
  item_tenda_id UUID;
  item_trelica_id UUID;
  order_id UUID;
  user_admin_id UUID;
BEGIN
  -- Endereço do armazém staging
  INSERT INTO addresses (id, street, number, complement, neighborhood, zip_code, city, state, country,
                         latitude, longitude, created_at, updated_at)
  VALUES (
    gen_random_uuid(), 'Rua Staging', '500', 'Galpão S', 'Industrial', '01234-000', 'São Paulo', 'SP', 'Brasil',
    -23.55, -46.63, NOW(), NOW()
  ) RETURNING id INTO warehouse_addr_id;

  -- Local armazém
  INSERT INTO locations (id, name, type, address_id, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(), 'Armazém Staging', 'WAREHOUSE', warehouse_addr_id, true, NOW(), NOW()
  ) RETURNING id INTO warehouse_loc_id;

  -- Local evento (usando a OS STG-2025-001)
  SELECT id INTO order_id FROM orders WHERE code = 'STG-2025-001' LIMIT 1;
  INSERT INTO locations (id, name, type, order_id, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(), 'Evento Staging', 'EVENT', order_id, true, NOW(), NOW()
  ) RETURNING id INTO event_loc_id;

  -- IDs de itens do warehouse staging
  SELECT id INTO item_tenda_id FROM items WHERE sku = 'TENDA-3X3-STG';
  SELECT id INTO item_trelica_id FROM items WHERE sku = 'TRELI-5M-STG';

  -- Usuário admin staging
  SELECT id INTO user_admin_id FROM users WHERE email = 'admin.staging@eventos.com';

  -- Inventário
  INSERT INTO inventory (location_id, item_id, quantity, last_count_at, updated_by, created_at, updated_at)
  VALUES
    (warehouse_loc_id, item_tenda_id, 5, NOW(), user_admin_id, NOW(), NOW()),
    (warehouse_loc_id, item_trelica_id, 20, NOW(), user_admin_id, NOW(), NOW());

  -- Alocações
  INSERT INTO allocations (id, item_id, location_id, quantity, period_start, period_end, status,
                           created_at, created_by, updated_at)
  VALUES
    (gen_random_uuid(), item_tenda_id, event_loc_id, 1, '2025-09-01 08:00:00', '2025-09-02 08:00:00', 'RESERVED', NOW(), user_admin_id, NOW()),
    (gen_random_uuid(), item_trelica_id, event_loc_id, 5, '2025-09-01 08:00:00', '2025-09-02 08:00:00', 'RESERVED', NOW(), user_admin_id, NOW());

  -- Movimentações
  INSERT INTO movements (id, item_id, from_location_id, to_location_id, quantity, movement_type,
                         document_ref, reason, occurred_at, created_by)
  VALUES
    (gen_random_uuid(), item_tenda_id, warehouse_loc_id, event_loc_id, 1, 'OUTBOUND', 'STG-2025-001', 'Envio staging', NOW(), user_admin_id),
    (gen_random_uuid(), item_trelica_id, warehouse_loc_id, event_loc_id, 5, 'OUTBOUND', 'STG-2025-001', 'Envio staging', NOW(), user_admin_id);
END $$;