#!/usr/bin/env node
// scripts/healthcheck.js
/**
 * Verifica se um banco de dados específico está saudável e aceitando conexões.
 * Utiliza o utilitário nativo pg_isready do PostgreSQL.
 */
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { PROFILES, getContainerName, getDbUser } = require('./common/config');

async function checkProfile(profile) {
  const container = getContainerName(profile);
  const user = getDbUser();

  logger.info(`🩺 Verificando a saúde do banco ${profile}...`);

  try {
    // Passamos { stdio: 'pipe' } para que o nosso executor capture o stdout
    // em vez de apenas jogá-lo solto no terminal
    const { stdout } = await exec(
      'docker', 
      ['exec', container, 'pg_isready', '-U', user], 
      { stdio: 'pipe' }
    );

    if (stdout.includes('accepting connections')) {
      logger.success(`✅ Banco ${profile} está pronto para conexões.`);
      return true;
    } else {
      logger.warn(`⚠️ Banco ${profile} respondeu, mas não está pronto: ${stdout}`);
      return false;
    }
  } catch (err) {
    // Se o pg_isready retornar um código de erro (ex: container offline ou banco reiniciando),
    // o executor.js vai lançar uma exceção. Nós pegamos o output real do erro aqui:
    const output = err.stdout || err.stderr || 'Container pode estar offline.';
    logger.error(`❌ Banco ${profile} não está acessível. Detalhes: ${output}`);
    return false;
  }
}

async function main() {
  const profile = process.argv[2];
  
  if (!profile) {
    logger.error('❌ Uso incorreto: Você deve especificar um perfil para verificar.');
    logger.info(`Comando: node scripts/healthcheck.js <perfil>`);
    logger.info(`Perfis disponíveis: ${PROFILES.join(', ')}`);
    process.exit(1);
  }

  if (!PROFILES.includes(profile)) {
    logger.error(`❌ Perfil inválido: "${profile}".`);
    process.exit(1);
  }

  const isReady = await checkProfile(profile);
  // Retorna código 0 para sucesso ou 1 para falha (útil se você usar isso em pipelines de CI/CD)
  process.exit(isReady ? 0 : 1);
}

main().catch(err => {
  logger.error(`Erro fatal no healthcheck: ${err.message}`);
  process.exit(1);
});