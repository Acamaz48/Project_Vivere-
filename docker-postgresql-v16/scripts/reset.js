#!/usr/bin/env node
// scripts/reset.js
/**
 * Reseta completamente um ou todos os bancos de dados.
 * Fluxo: Derruba o container e volume do docker -> Apaga a pasta de dados física -> Sobe o container novamente.
 */
const fs = require('fs').promises;
const path = require('path');
const { exec, execWithRetry } = require('./common/executor');
const logger = require('./common/logger');
const { PROFILES, COMPOSE_DIR } = require('./common/config');

const composeFile = path.join(COMPOSE_DIR, 'docker-compose.yml');
const env = process.env.SEED_ENV || 'development';

/**
 * Constrói a string de profiles para docker compose
 * @param {string|null} specificProfile - Se fornecido, usa apenas este profile
 * @returns {string} String com todos os --profile flags
 */
function buildProfilesFlag(specificProfile = null) {
  if (specificProfile) {
    return `--profile ${specificProfile}`;
  }
  // Para "all", incluir todos os profiles
  return PROFILES.map(p => `--profile ${p}`).join(' ');
}

/**
 * Garante que a rede Docker backend-network existe
 */
async function ensureBackendNetwork() {
  try {
    logger.debug('🔍 Verificando se a rede backend-network existe...');
    
    // Tenta inspecionar a rede
    await exec('docker', ['network', 'inspect', 'backend-network'], {
      stdio: 'pipe',
      reject: false
    });
    
    logger.debug('✅ Rede backend-network já existe.');
  } catch (err) {
    // Se não existir, cria
    logger.info('🌐 Criando rede Docker backend-network...');
    try {
      await exec('docker', ['network', 'create', 'backend-network']);
      logger.success('✅ Rede backend-network criada com sucesso.');
    } catch (createErr) {
      logger.warn(`⚠️ Não foi possível criar a rede: ${createErr.message}`);
      // Continua mesmo se não conseguir criar, talvez já exista
    }
  }
}

/**
 * Remove fisicamente a pasta de dados de um perfil específico.
 */
async function clearDataFolder(profile) {
  const dataPath = path.join(COMPOSE_DIR, profile, 'data', env);
  logger.debug(`Limpando pasta física: ${dataPath}`);
  
  try {
    // force: true ignora se a pasta não existir (ENOENT), mas lança erro se houver problema de permissão
    await fs.rm(dataPath, { recursive: true, force: true });
  } catch (err) {
    logger.error(`❌ Erro ao apagar a pasta de dados de ${profile}. Verifique se algum programa está segurando o arquivo: ${err.message}`);
    throw err;
  }
}

async function resetProfile(profile) {
  logger.info(`🔄 Iniciando reset completo do banco ${profile}...`);

  try {
    // 0. Garante que a rede existe
    await ensureBackendNetwork();
    
    // 1. Para o container e remove volumes criados pelo Docker (-v)
    logger.info(`   🛑 Derrubando container e volumes do Docker...`);
    const profilesFlag = buildProfilesFlag(profile);
    await exec(`docker compose -f "${composeFile}" ${profilesFlag} down -v`);

    // 2. Remove os dados físicos do diretório mapeado
    logger.info(`   🧹 Limpando arquivos de dados locais...`);
    await clearDataFolder(profile);

    // 3. Sobe o container novamente (com retry caso o Docker demore a liberar a porta/rede)
    logger.info(`   🚀 Subindo container novamente...`);
    await execWithRetry(`docker compose -f "${composeFile}" ${profilesFlag} up -d`, [], {}, 3, 3000);

    logger.success(`✅ Banco ${profile} foi resetado com sucesso e está subindo em background.`);
  } catch (err) {
    logger.error(`❌ Falha no processo de reset do ${profile}.`);
    throw err; // O catch principal do main vai pegar isso
  }
}

async function resetAll() {
  logger.warn('⚠️ ATENÇÃO: Iniciando reset completo de TODOS os bancos e containers de infraestrutura.');
  
  try {
    // 0. Garante que a rede existe
    await ensureBackendNetwork();
    
    const profilesFlag = buildProfilesFlag();
    
    logger.info(`   🛑 Derrubando toda a infraestrutura e volumes...`);
    await exec(`docker compose -f "${composeFile}" ${profilesFlag} down -v`);

    logger.info(`   🧹 Limpando arquivos de dados de todos os perfis...`);
    for (const profile of PROFILES) {
      await clearDataFolder(profile);
    }

    logger.info(`   🚀 Subindo toda a infraestrutura novamente...`);
    await execWithRetry(`docker compose -f "${composeFile}" ${profilesFlag} up -d`, [], {}, 3, 3000);

    logger.success('✅ Todos os bancos foram resetados. A infraestrutura está reiniciando.');
  } catch (err) {
    logger.error(`❌ Falha no processo de reset global.`);
    throw err;
  }
}

async function main() {
  const profile = process.argv[2];
  
  if (profile && profile !== 'all') {
    if (!PROFILES.includes(profile)) {
      logger.error(`❌ Perfil inválido: "${profile}".`);
      logger.info(`Use um de: ${PROFILES.join(', ')} ou "all".`);
      process.exit(1);
    }
    await resetProfile(profile);
  } else {
    await resetAll();
  }
}

main().catch(err => {
  logger.error(`Erro fatal no script de reset: ${err.message}`);
  process.exit(1);
});