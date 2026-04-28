#!/usr/bin/env node
// scripts/restore.js
/**
 * Restaura um banco a partir de um arquivo de backup.
 * De forma interativa, lista os backups disponíveis e solicita confirmação.
 */
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
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
 * Lista os backups disponíveis para um determinado perfil, ordenados do mais recente para o mais antigo.
 */
async function listBackups(profile) {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    // Filtra pelo prefixo do perfil e extensão, depois inverte para o mais novo ficar no topo
    return files
      .filter(f => f.startsWith(`${profile}-`) && f.endsWith('.sql'))
      .sort()
      .reverse();
  } catch (err) {
    // Se a pasta não existir ou estiver inacessível, retorna vazio
    return [];
  }
}

/**
 * Utilitário para ler input do usuário no terminal.
 */
function promptUser(query) {
  const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
  });
  
  return new Promise(resolve => rl.question(query, ans => { 
    rl.close(); 
    resolve(ans); 
  }));
}

/**
 * Executa a restauração do banco injetando o SQL via container.
 */
async function restoreProfile(profile, backupFile) {
  const container = getContainerName(profile);
  const dbName = getDbName(profile);
  const dbUser = getDbUser();
  const filePath = path.join(BACKUP_DIR, backupFile);

  logger.info(`♻️ Restaurando banco ${profile} (${dbName}) a partir de ${backupFile}...`);
  logger.warn(`⚠️ Dica DevOps: Certifique-se de que o microserviço esteja pausado para evitar locks de conexão durante o restore.`);

  // O novo executor aceita redirecionamento (<) via shell: true nativamente
  const command = `docker exec -i ${container} psql -U ${dbUser} -d ${dbName} < "${filePath}"`;

  try {
    await exec(command);
    logger.success(`✅ Banco ${profile} restaurado com sucesso.`);
  } catch (err) {
    logger.error(`❌ Falha na restauração: ${err.message}`);
    throw err;
  }
}

async function main() {
  const profile = process.argv[2];
  
  if (!profile || !PROFILES.includes(profile)) {
    logger.error(`❌ Uso incorreto. Você deve especificar um perfil válido.`);
    logger.info(`Comando: node scripts/restore.js <perfil>`);
    logger.info(`Perfis disponíveis: ${PROFILES.join(', ')}`);
    process.exit(1);
  }

  // Busca os backups na pasta
  const backups = await listBackups(profile);
  
  if (backups.length === 0) {
    logger.error(`Nenhum backup encontrado para o perfil "${profile}" em ${BACKUP_DIR}`);
    process.exit(1);
  }

  // Interface interativa
  logger.info(`Backups disponíveis para ${profile}:`);
  backups.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

  const answer = await promptUser('\nEscolha o número do backup a restaurar (ou digite "cancelar"): ');
  const idx = parseInt(answer) - 1;
  
  if (isNaN(idx) || idx < 0 || idx >= backups.length) {
    logger.warn('🚫 Operação de restauração cancelada pelo usuário.');
    process.exit(0);
  }

  const selectedBackup = backups[idx];
  logger.warn(`\n⚠️ ATENÇÃO: Isso irá SOBRESCREVER os dados atuais do banco "${dbName}" com o backup escolhido.`);
  const confirm = await promptUser(`Tem certeza que deseja continuar? (s/N): `);
  
  if (confirm.toLowerCase() !== 's') {
    logger.warn('🚫 Operação cancelada.');
    process.exit(0);
  }

  await restoreProfile(profile, selectedBackup);
}

main().catch(err => {
  logger.error(`Erro fatal no script de restore: ${err.message}`);
  process.exit(1);
});