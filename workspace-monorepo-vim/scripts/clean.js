#!/usr/bin/env node
// scripts/clean.js
/**
 * Limpa diretórios temporários, caches e dependências do monorepo.
 * Totalmente nativo (sem dependência de npx/del-cli) e com retry para arquivos travados (Windows).
 */
const fs = require('fs').promises;
const path = require('path');
const logger = require('./common/logger');
const { CLEAN_TARGETS } = require('./common/config');

/**
 * Remove um arquivo ou diretório de forma segura, com tentativas múltiplas.
 * Excelente para evitar erros EBUSY/EPERM no Windows quando o antivírus ou a IDE travam a pasta.
 */
async function safeRemove(targetPath) {
  const maxRetries = 5;
  const retryDelayMs = 1000;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      // O force: true garante que não dê erro se o arquivo já não existir
      await fs.rm(targetPath, { recursive: true, force: true });
      return true; // Sucesso
    } catch (err) {
      if (i === maxRetries) {
        logger.warn(`⚠️ Não foi possível remover: ${targetPath}`);
        logger.debug(`Motivo: ${err.message}`);
        return false;
      }
      logger.debug(`[Retry ${i}/${maxRetries}] Arquivo travado. Aguardando para tentar limpar: ${targetPath}`);
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
}

/**
 * Resolve caminhos que possuem o curinga "*" (asterisco).
 * Substitui a necessidade de usar bibliotecas de "glob" ou "del-cli".
 */
async function resolvePaths(targetPath) {
  if (!targetPath.includes('*')) {
    return [targetPath]; // Caminho direto (ex: node_modules)
  }

  // Se tem asterisco, dividimos o caminho. Ex: "apps/backend/*/prisma"
  // baseDir = "apps/backend/" | suffix = "/prisma"
  const [baseDir, suffix] = targetPath.split('*');
  
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    const directories = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    // Remonta os caminhos com as pastas reais encontradas
    return directories.map(dir => path.join(baseDir, dir, suffix || ''));
  } catch (err) {
    if (err.code === 'ENOENT') return []; // Diretório base nem existe ainda
    throw err;
  }
}

async function processTarget(what) {
  const targetPattern = CLEAN_TARGETS[what];
  
  if (!targetPattern) {
    logger.error(`❌ Alvo desconhecido: "${what}"`);
    process.exit(1);
  }

  // Resolve os caminhos (se tiver "*" ele vira um array de vários caminhos reais)
  const actualPaths = await resolvePaths(targetPattern);
  
  if (actualPaths.length === 0) {
    logger.debug(`Nada encontrado para limpar em: ${what}`);
    return;
  }

  let successCount = 0;
  for (const p of actualPaths) {
    logger.info(`🧹 Limpando: ${path.relative(process.cwd(), p)}...`);
    const success = await safeRemove(p);
    if (success) successCount++;
  }

  if (successCount > 0) {
    logger.success(`✅ Alvo "${what}" limpo com sucesso.`);
  }
}

async function main() {
  const what = process.argv[2]; // ex: all, nx, dist, prisma...
  const validTargets = Object.keys(CLEAN_TARGETS);

  if (!what) {
    logger.error('❌ Uso incorreto. Especifique o que deseja limpar.');
    logger.info(`Comando: node scripts/clean.js <alvo>`);
    logger.info(`Alvos disponíveis: all, ${validTargets.join(', ')}`);
    process.exit(1);
  }

  if (what === 'all') {
    logger.info('🔄 Iniciando limpeza completa do monorepo...');
    for (const key of validTargets) {
      await processTarget(key);
    }
    logger.success('✨ Limpeza completa finalizada!');
  } else {
    await processTarget(what);
  }
}

main().catch(err => {
  logger.error(`❌ Erro fatal na limpeza: ${err.message}`);
  process.exit(1);
});