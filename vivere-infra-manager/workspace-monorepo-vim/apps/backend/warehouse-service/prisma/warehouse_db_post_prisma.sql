-- =====================================================
-- warehouse_db_post_prisma.sql
-- Complementos para warehouse_db: funções, triggers,
-- constraints CHECK e índices parciais
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
DROP TRIGGER IF EXISTS trg_categories_audit ON categories;
CREATE TRIGGER trg_categories_audit AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_categories_timestamp ON categories;
CREATE TRIGGER trg_categories_timestamp BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_items_audit ON items;
CREATE TRIGGER trg_items_audit AFTER INSERT OR UPDATE OR DELETE ON items FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_items_timestamp ON items;
CREATE TRIGGER trg_items_timestamp BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_bom_audit ON bom;
CREATE TRIGGER trg_bom_audit AFTER INSERT OR UPDATE OR DELETE ON bom FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_bom_timestamp ON bom;
CREATE TRIGGER trg_bom_timestamp BEFORE UPDATE ON bom FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

-- Índices únicos parciais (substituindo os únicos padrão do Prisma)

-- Items: sku único quando não deletado
DO $$
BEGIN
    -- Remove a constraint única padrão criada pelo Prisma
    EXECUTE 'ALTER TABLE items DROP CONSTRAINT IF EXISTS items_sku_key';
    -- Recria como índice parcial
    CREATE UNIQUE INDEX IF NOT EXISTS items__sku__uq ON items(sku) WHERE deleted_at IS NULL;
END $$;

-- Garantir que a constraint CHECK para unit seja aplicada (o Prisma cria automaticamente se usarmos enum)
-- Mas podemos reforçar com uma constraint de verificação no nível do banco
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_unit_check;
ALTER TABLE items ADD CONSTRAINT items_unit_check CHECK (unit IN ('m', 'un', 'm2', 'kg', 'dia', 'kit'));

-- Índices adicionais
CREATE INDEX IF NOT EXISTS items__category_id__idx ON items(category_id);
CREATE INDEX IF NOT EXISTS bom__parent_item_id__idx ON bom(parent_item_id);
CREATE INDEX IF NOT EXISTS bom__child_item_id__idx ON bom(child_item_id);

-- Nota: A auto-referência em categories (parent_id) não tem cascade definido; isso fica a cargo da aplicação.