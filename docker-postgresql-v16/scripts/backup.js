#!/usr/bin/env node
// scripts/backup.js
/**
 * Gera dump de um ou todos os bancos PostgreSQL.
 * Agora utiliza rotinas centralizadas e gera backups "self-cleaning" 
 * (com drop table prévio) para facilitar o restore seguro.
 */
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { 
  PROFILES, 
  BACKUP_DIR, 
  getContainerName, 
  getDbName, 
  getDbUser 
} = require('./common/config');

/**
 * Garante que a pasta de backups exista antes de tentar salvar arquivos.
 */
async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function backupProfile(profile) {
  const container = getContainerName(profile);
  const dbName = getDbName(profile);
  const dbUser = getDbUser();
  
  // Gera um timestamp seguro para nome de arquivo (sem dois pontos)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile = path.join(BACKUP_DIR, `${profile}-${timestamp}.sql`);

  logger.info(`📦 Iniciando backup do banco ${profile} (${dbName})...`);

  // Montamos o comando inteiro como uma string única para o shell processar o redirecionamento (>)
  // Adicionamos --clean e --if-exists para que o restore futuro seja indolor e não dê conflito de dados existentes
  const command = `docker exec ${container} pg_dump -U ${dbUser} --clean --if-exists -d ${dbName} > "${outputFile}"`;

  try {
    // Como nosso novo executor usa shell: true por padrão, o redirecionamento '>' vai funcionar perfeitamente
    await exec(command);
    logger.success(`✅ Backup de ${profile} salvo com sucesso em:`);
    logger.info(`   📄 ${outputFile}`);
  } catch (err) {
    logger.error(`❌ Falha no backup do banco ${profile}: ${err.message}`);
    throw err;
  }
}

async function backupAll() {
  logger.info('🔄 Iniciando processo de backup para todos os bancos...');
  for (const profile of PROFILES) {
    await backupProfile(profile);
  }
  logger.success('✅ Todos os backups foram concluídos com sucesso.');
}

async function main() {
  await ensureBackupDir();
  
  const profile = process.argv[2];
  
  if (profile && profile !== 'all') {
    if (!PROFILES.includes(profile)) {
      logger.error(`❌ Perfil inválido: "${profile}".`);
      logger.info(`Use um de: ${PROFILES.join(', ')} ou "all".`);
      process.exit(1);
    }
    await backupProfile(profile);
  } else {
    await backupAll();
  }
}

main().catch(err => {
  logger.error(`Erro fatal no script de backup: ${err.message}`);
  process.exit(1);
});