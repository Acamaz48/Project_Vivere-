-- =====================================================
-- identity_db_post_prisma.sql
-- Complementos para identity_db: funções, triggers,
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
DROP TRIGGER IF EXISTS trg_organizations_audit ON organizations;
CREATE TRIGGER trg_organizations_audit AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_organizations_timestamp ON organizations;
CREATE TRIGGER trg_organizations_timestamp BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_persons_audit ON persons;
CREATE TRIGGER trg_persons_audit AFTER INSERT OR UPDATE OR DELETE ON persons FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_persons_timestamp ON persons;
CREATE TRIGGER trg_persons_timestamp BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_organization_persons_audit ON organization_persons;
CREATE TRIGGER trg_organization_persons_audit AFTER INSERT OR UPDATE OR DELETE ON organization_persons FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_addresses_audit ON addresses;
CREATE TRIGGER trg_addresses_audit AFTER INSERT OR UPDATE OR DELETE ON addresses FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_addresses_timestamp ON addresses;
CREATE TRIGGER trg_addresses_timestamp BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_consents_audit ON consents;
CREATE TRIGGER trg_consents_audit AFTER INSERT OR UPDATE OR DELETE ON consents FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_consents_timestamp ON consents;
CREATE TRIGGER trg_consents_timestamp BEFORE UPDATE ON consents FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

-- Índices únicos parciais (substituindo os únicos padrão do Prisma)

-- Organizations: tax_id único quando não deletado
DO $$
BEGIN
    EXECUTE 'ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_tax_id_key';
    CREATE UNIQUE INDEX IF NOT EXISTS organizations__tax_id__uq ON organizations(tax_id) WHERE deleted_at IS NULL;
END $$;

-- Persons: tax_id único quando não deletado e não nulo
DO $$
BEGIN
    EXECUTE 'ALTER TABLE persons DROP CONSTRAINT IF EXISTS persons_tax_id_key';
    CREATE UNIQUE INDEX IF NOT EXISTS persons__tax_id__uq ON persons(tax_id) WHERE deleted_at IS NULL AND tax_id IS NOT NULL;
END $$;

-- Índices adicionais
CREATE INDEX IF NOT EXISTS addresses__organization_id__idx ON addresses(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS addresses__person_id__idx ON addresses(person_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS addresses__zip_code__idx ON addresses(zip_code);
CREATE INDEX IF NOT EXISTS consents__person_id__idx ON consents(person_id);

-- Constraint de verificação para addresses: organization_id XOR person_id
ALTER TABLE addresses DROP CONSTRAINT IF EXISTS addresses_owner_check;
ALTER TABLE addresses ADD CONSTRAINT addresses_owner_check CHECK (
    (organization_id IS NOT NULL AND person_id IS NULL) OR
    (organization_id IS NULL AND person_id IS NOT NULL)
);