-- =====================================================
-- auth_db_post_prisma.sql
-- Complementos para auth_db: funções, triggers e índices
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
DROP TRIGGER IF EXISTS trg_users_audit ON users;
CREATE TRIGGER trg_users_audit AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_users_timestamp ON users;
CREATE TRIGGER trg_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_login_history_audit ON login_history;
CREATE TRIGGER trg_login_history_audit AFTER INSERT ON login_history FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_roles_audit ON roles;
CREATE TRIGGER trg_roles_audit AFTER INSERT OR UPDATE OR DELETE ON roles FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS trg_roles_timestamp ON roles;
CREATE TRIGGER trg_roles_timestamp BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_audit_timestamp();

DROP TRIGGER IF EXISTS trg_user_roles_audit ON user_roles;
CREATE TRIGGER trg_user_roles_audit AFTER INSERT OR UPDATE OR DELETE ON user_roles FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Índice único parcial para email (somente quando deleted_at IS NULL)
-- Remove a constraint única padrão criada pelo Prisma e recria como índice parcial
DO $$
BEGIN
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key';
    CREATE UNIQUE INDEX IF NOT EXISTS users__email__uq ON users(lower(email)) WHERE deleted_at IS NULL;
END $$;

-- Índices adicionais recomendados
CREATE INDEX IF NOT EXISTS users__deleted_at__idx ON users(deleted_at);
CREATE INDEX IF NOT EXISTS login_history__login_at__idx ON login_history(login_at);