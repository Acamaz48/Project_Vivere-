#!/usr/bin/env node
// scripts/seed.js
/**
 * Executa scripts de seed manualmente.
 * Copia os arquivos .sql locais para o container e os executa via psql.
 */
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { 
  PROFILES, 
  COMPOSE_DIR, 
  getContainerName, 
  getDbName, 
  getDbUser 
} = require('./common/config');

async function seedProfile(profile) {
  const container = getContainerName(profile);
  const dbName = getDbName(profile);
  const dbUser = getDbUser();
  const seedDir = path.join(COMPOSE_DIR, profile, 'seeds');

  logger.info(`🌱 Preparando seed para o banco ${profile} (${dbName})...`);

  try {
    // 1. Verifica se o diretório de seeds existe para este perfil
    try {
      await fs.access(seedDir);
    } catch {
      logger.warn(`⚠️  Nenhum diretório de seeds encontrado em ${seedDir}. Pulando...`);
      return;
    }

    const files = await fs.readdir(seedDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));

    if (sqlFiles.length === 0) {
      logger.info(`ℹ️  Nenhum arquivo .sql encontrado em ${seedDir}.`);
      return;
    }

    // 2. Copia a pasta de seeds para dentro do container (em /tmp)
    // O comando "docker cp" não aceita "shell: true" muito bem com curingas no Windows, 
    // então passamos os argumentos separadamente na nova estrutura do executor
    logger.info(`   Copiando arquivos de seed para o container ${container}...`);
    await exec('docker', ['cp', `${seedDir}/.`, `${container}:/tmp/seeds/`]);

    // 3. Executa cada arquivo .sql encontrado
    for (const file of sqlFiles) {
      logger.info(`   Executando script: ${file}...`);
      
      // Montamos os argumentos para o docker exec rodar o psql
      const psqlArgs = [
        'exec', 
        container, 
        'psql', 
        '-U', dbUser, 
        '-d', dbName, 
        '-f', `/tmp/seeds/${file}`
      ];
      
      await exec('docker', psqlArgs);
    }

    logger.success(`✅ Seed concluído com sucesso para ${profile}.`);
  } catch (err) {
    logger.error(`❌ Falha ao rodar seed em ${profile}: ${err.message}`);
    throw err;
  }
}

async function seedAll() {
  logger.info('🔄 Iniciando processo de seed para todos os bancos...');
  for (const profile of PROFILES) {
    await seedProfile(profile);
  }
  logger.success('✅ Todos os seeds foram concluídos.');
}

async function main() {
  const profile = process.argv[2];
  
  if (profile && profile !== 'all') {
    if (!PROFILES.includes(profile)) {
      logger.error(`❌ Perfil inválido: "${profile}".`);
      logger.info(`Use um de: ${PROFILES.join(', ')} ou "all".`);
      process.exit(1);
    }
    await seedProfile(profile);
  } else {
    await seedAll();
  }
}

main().catch(err => {
  logger.error(`Erro fatal no script de seed: ${err.message}`);
  process.exit(1);
});