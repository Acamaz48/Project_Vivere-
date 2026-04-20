-- =====================================================
-- service-order_db_post_prisma.sql
-- Complementos para service-order_db: funções, triggers,
-- constraints de verificação e índices parciais
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
DROP TRIGGER IF EXISTS trg_orders_audit ON orders;
CREATE TRIGGER trg_orders_audit AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_orders_timestamp ON orders;
CREATE TRIGGER trg_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_order_items_audit ON order_items;
CREATE TRIGGER trg_order_items_audit AFTER INSERT OR UPDATE OR DELETE ON order_items FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_order_items_timestamp ON order_items;
CREATE TRIGGER trg_order_items_timestamp BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

-- Índices adicionais (parciais e compostos)

-- Índice único parcial para code (somente quando não deletado)
DO $$
BEGIN
    EXECUTE 'ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_code_key';
    CREATE UNIQUE INDEX IF NOT EXISTS orders__code__uq ON orders(code) WHERE deleted_at IS NULL;
END $$;

-- Índice para customer_id (já existe via Prisma, mas podemos reforçar com condição)
CREATE INDEX IF NOT EXISTS orders__customer_id__partial_idx ON orders(customer_type, customer_id) WHERE deleted_at IS NULL;

-- Índices para order_items
CREATE INDEX IF NOT EXISTS order_items__order_id__idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items__supplier_id__idx ON order_items(supplier_id);
CREATE INDEX IF NOT EXISTS order_items__period_start_end__idx ON order_items(period_start, period_end);

-- Constraints de verificação adicionais (além das já incluídas no Prisma)

-- Check para orders: customer_id deve ser compatível com customer_type
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_check;
ALTER TABLE orders ADD CONSTRAINT orders_customer_check CHECK (
    (customer_type = 'ORGANIZATION' AND customer_id IS NOT NULL) OR
    (customer_type = 'PERSON' AND customer_id IS NOT NULL)
);

-- Campo total_price (gerado) – opcional, pode ser mantido via trigger
-- Se desejar manter a coluna gerada, descomente as linhas abaixo:
-- ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(18,6) GENERATED ALWAYS AS (quantity * number_of_days * daily_unit_price - discount) STORED;

-- Índice para total_price (se a coluna for criada)
-- CREATE INDEX IF NOT EXISTS order_items__total_price__idx ON order_items(total_price);