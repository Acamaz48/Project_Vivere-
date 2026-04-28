#!/usr/bin/env node
// scripts/clean.js
/**
 * Limpa os dados de um ou todos os bancos de dados.
 * Remove os diretórios mapeados nos volumes do Docker para forçar a recriação do zero.
 */
const fs = require('fs').promises;
const path = require('path');
const logger = require('./common/logger');
const { PROFILES, COMPOSE_DIR } = require('./common/config');

async function cleanProfile(profile) {
  // Define o caminho do volume de dados baseado no ambiente
  const env = process.env.SEED_ENV || 'development';
  const dataPath = path.join(COMPOSE_DIR, profile, 'data', env);
  
  logger.info(`🧹 Analisando diretório de dados do banco ${profile}...`);
  logger.debug(`Caminho alvo: ${dataPath}`);

  try {
    // Verifica se a pasta realmente existe antes de tentar deletar
    await fs.access(dataPath);
    
    // Remove a pasta e todo o seu conteúdo recursivamente
    await fs.rm(dataPath, { recursive: true, force: true });
    logger.success(`✅ Dados locais de ${profile} (${env}) foram completamente removidos.`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Se a pasta não existir, não é um erro, é apenas um aviso informativo
      logger.info(`ℹ️  A pasta de dados de ${profile} já está vazia ou não existe. Pulando...`);
    } else {
      logger.error(`❌ Falha inesperada ao limpar ${profile}: ${err.message}`);
      throw err;
    }
  }
}

async function cleanAll() {
  logger.warn('⚠️  ATENÇÃO: Este comando apagará FISICAMENTE todos os dados locais mapeados nos volumes.');
  logger.info('🔄 Iniciando limpeza em lote...');
  
  for (const profile of PROFILES) {
    await cleanProfile(profile);
  }
  
  logger.success('✅ Limpeza completa finalizada com sucesso.');
}

async function main() {
  const profile = process.argv[2];
  
  if (profile && profile !== 'all') {
    if (!PROFILES.includes(profile)) {
      logger.error(`❌ Perfil inválido: "${profile}".`);
      logger.info(`Use um de: ${PROFILES.join(', ')} ou "all".`);
      process.exit(1);
    }
    await cleanProfile(profile);
  } else {
    await cleanAll();
  }
}

main().catch(err => {
  logger.error(`Erro fatal no script de clean: ${err.message}`);
  process.exit(1);
});