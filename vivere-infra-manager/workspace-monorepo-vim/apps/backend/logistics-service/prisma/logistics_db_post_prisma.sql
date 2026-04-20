-- =====================================================
-- logistics_db_post_prisma.sql
-- Complementos para logistics_db: funções, triggers,
-- índices GiST, particionamento e constraints
-- Executar APÓS as migrações do Prisma
-- =====================================================

-- Habilitar extensões (se ainda não estiverem)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Função para atualizar automaticamente updated_at e preservar created_at
CREATE OR REPLACE FUNCTION update_audit_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.created_at = OLD.created_at;
    NEW.created_by = OLD.created_by;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de auditoria (se não existir)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs__table_record__idx ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS audit_logs__changed_at__idx ON audit_logs(changed_at);

-- Função genérica de trigger para auditoria
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_user UUID;
    v_op TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_op := 'DELETE';
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        v_user := OLD.updated_by;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_op := 'UPDATE';
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_user := NEW.updated_by;
        IF (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL) THEN
            v_op := 'SOFT_DELETE';
        END IF;
    ELSIF (TG_OP = 'INSERT') THEN
        v_op := 'INSERT';
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        v_user := NEW.created_by;
    END IF;

    IF (TG_OP = 'INSERT' OR TG_OP = 'DELETE' OR v_old_data IS DISTINCT FROM v_new_data) THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, COALESCE(NEW.id, OLD.id), v_op, v_old_data, v_new_data, v_user);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria e timestamp nas tabelas
DROP TRIGGER IF EXISTS trg_addresses_audit ON addresses;
CREATE TRIGGER trg_addresses_audit AFTER INSERT OR UPDATE OR DELETE ON addresses FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_addresses_timestamp ON addresses;
CREATE TRIGGER trg_addresses_timestamp BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_locations_audit ON locations;
CREATE TRIGGER trg_locations_audit AFTER INSERT OR UPDATE OR DELETE ON locations FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_locations_timestamp ON locations;
CREATE TRIGGER trg_locations_timestamp BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_inventory_audit ON inventory;
CREATE TRIGGER trg_inventory_audit AFTER INSERT OR UPDATE OR DELETE ON inventory FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_inventory_timestamp ON inventory;
CREATE TRIGGER trg_inventory_timestamp BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_allocations_audit ON allocations;
CREATE TRIGGER trg_allocations_audit AFTER INSERT OR UPDATE OR DELETE ON allocations FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_allocations_timestamp ON allocations;
CREATE TRIGGER trg_allocations_timestamp BEFORE UPDATE ON allocations FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_movements_audit ON movements;
CREATE TRIGGER trg_movements_audit AFTER INSERT ON movements FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Índices GiST para period (range) em allocations
-- Primeiro, precisamos adicionar uma coluna range que combine period_start e period_end
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS period tstzrange GENERATED ALWAYS AS (tstzrange(period_start, period_end, '[)')) STORED;

CREATE INDEX IF NOT EXISTS allocations__period__gist ON allocations USING GIST (period);
CREATE INDEX IF NOT EXISTS allocations__item_location_period__idx ON allocations(item_id, location_id, period);

-- Índices adicionais
CREATE INDEX IF NOT EXISTS movements__occurred_at__idx ON movements(occurred_at);

-- Constraint de verificação para locations: quando type = EVENT, order_id é obrigatório
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_event_order_check;
ALTER TABLE locations ADD CONSTRAINT locations_event_order_check CHECK (
    (type = 'EVENT' AND order_id IS NOT NULL) OR
    (type != 'EVENT' AND order_id IS NULL)
);

-- Função de reserva atômica (anti-overbooking)
CREATE OR REPLACE FUNCTION reserve_item(
    p_item_id UUID,
    p_location_id UUID,
    p_quantity NUMERIC,
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ,
    p_created_by UUID
) RETURNS UUID AS $$
DECLARE
    v_available NUMERIC;
    v_reserved NUMERIC;
    v_allocation_id UUID;
BEGIN
    -- Trava as linhas de alocação que conflitam no período (impede inserções concorrentes)
    PERFORM 1 FROM allocations
    WHERE item_id = p_item_id
      AND location_id = p_location_id
      AND period && tstzrange(p_start, p_end, '[)')
    FOR UPDATE;

    -- Soma as quantidades já reservadas no período
    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
    FROM allocations
    WHERE item_id = p_item_id
      AND location_id = p_location_id
      AND period && tstzrange(p_start, p_end, '[)');

    -- Obtém o estoque físico
    SELECT quantity INTO v_available
    FROM inventory
    WHERE location_id = p_location_id AND item_id = p_item_id;

    IF v_available IS NULL THEN
        RAISE EXCEPTION 'Item não encontrado no inventário do local';
    END IF;

    IF v_available - v_reserved < p_quantity THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, solicitado: %', v_available - v_reserved, p_quantity;
    END IF;

    -- Insere a nova reserva
    INSERT INTO allocations (item_id, location_id, quantity, period_start, period_end, created_by)
    VALUES (p_item_id, p_location_id, p_quantity, p_start, p_end, p_created_by)
    RETURNING id INTO v_allocation_id;

    RETURN v_allocation_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reserve_item IS 'Reserva atômica de item para um período, com verificação de disponibilidade';

-- Particionamento (opcional - recomendado para tabelas grandes)
-- Nota: O particionamento deve ser planejado com cuidado. Aqui estão exemplos de como criar
-- as tabelas particionadas. Se desejar ativar, comente as definições originais do Prisma
-- e use estas. Mas isso exigirá ajustes no Prisma (ou não usar Prisma para essas tabelas).
-- Recomenda-se criar partições manualmente após avaliar o volume de dados.

-- Exemplo para allocations (particionada por range de period_end):
-- CREATE TABLE IF NOT EXISTS allocations (
--     id UUID NOT NULL DEFAULT gen_random_uuid(),
--     item_id UUID NOT NULL,
--     location_id UUID NOT NULL REFERENCES locations(id),
--     quantity NUMERIC(18,6) NOT NULL,
--     period tstzrange NOT NULL,
--     status TEXT DEFAULT 'RESERVED',
--     created_at TIMESTAMPTZ DEFAULT NOW(),
--     created_by UUID NOT NULL,
--     updated_at TIMESTAMPTZ DEFAULT NOW(),
--     updated_by UUID,
--     PRIMARY KEY (id, period)
-- ) PARTITION BY RANGE (upper(period));
-- 
-- CREATE TABLE allocations_default PARTITION OF allocations DEFAULT;
-- 
-- -- Para movements:
-- CREATE TABLE IF NOT EXISTS movements (
--     id UUID NOT NULL DEFAULT gen_random_uuid(),
--     item_id UUID NOT NULL,
--     from_location_id UUID REFERENCES locations(id),
--     to_location_id UUID REFERENCES locations(id),
--     quantity NUMERIC(18,6) NOT NULL,
--     movement_type movement_type NOT NULL,
--     document_ref TEXT,
--     reason TEXT,
--     occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     created_by UUID NOT NULL,
--     PRIMARY KEY (id, occurred_at)
-- ) PARTITION BY RANGE (occurred_at);
-- 
-- CREATE TABLE movements_default PARTITION OF movements DEFAULT;