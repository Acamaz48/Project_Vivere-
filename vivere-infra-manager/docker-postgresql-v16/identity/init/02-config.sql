-- =====================================================
-- Configurações gerais do banco
-- =====================================================

-- Ajusta timezone para o fuso horário brasileiro (opcional)
ALTER DATABASE current_database() SET timezone TO 'America/Sao_Paulo';

-- Garante encoding UTF8 (já é padrão, mas reforça)
SET client_encoding = 'UTF8';