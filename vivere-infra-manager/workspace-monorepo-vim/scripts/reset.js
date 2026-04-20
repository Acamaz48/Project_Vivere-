#!/usr/bin/env node
// scripts/reset.js
/**
 * Reset profundo do monorepo: limpa dependências, reinstala pacotes e recria Prisma Clients.
 * Reutiliza a inteligência do clean.js para exclusão segura de ficheiros/pastas.
 */
const path = require('path');
const { exec, execWithRetry } = require('./common/executor');
const logger = require('./common/logger');

async function reset() {
  logger.info('\n🧹 Iniciando reset profundo do monorepo Vivere...\n');

  // Caminho absoluto para o nosso script de limpeza recém-otimizado
  const cleanScript = path.join(__dirname, 'clean.js');

  // =========================================================
  // FASE 1: Limpeza de Dependências
  // =========================================================
  logger.info('📦 Fase 1: Limpando node_modules e package-lock.json...');
  try {
    // Delegamos a responsabilidade da exclusão segura (com retry EBUSY) para o clean.js
    await exec('node', [cleanScript, 'modules']);
    await exec('node', [cleanScript, 'lock']);
    logger.success('✅ Dependências antigas removidas com sucesso.');
  } catch (err) {
    logger.error(`❌ Falha ao limpar dependências: ${err.message}`);
    throw err;
  }

  // =========================================================
  // FASE 2: Instalação de Pacotes
  // =========================================================
  logger.info('\n📦 Fase 2: Instalando pacotes via npm...');
  logger.debug('Parâmetros: --no-audit --no-fund --prefer-offline');
  
  const npmArgs = [
    'install',
    // '--no-bin-links',
    // '--no-optional',
    '--no-audit',
    '--no-fund',
    '--prefer-offline'
  ];

  try {
    // O npm install adora falhar por timeout de rede, o execWithRetry salva o dia aqui!
    await execWithRetry('npm', npmArgs, {}, 3, 5000);
    logger.success('✅ Pacotes instalados com sucesso.');
  } catch (err) {
    logger.error(`❌ Falha na instalação do npm: ${err.message}`);
    throw err;
  }

  // =========================================================
  // FASE 3: Geração do Prisma
  // =========================================================
  logger.info('\n⚙️  Fase 3: A gerar Prisma Client para os microserviços...');
  try {
    // Aqui usamos o exec normal, pois o Prisma generate é local e determinístico
    await exec('npm', ['run', 'prisma:generate']);
    logger.success('✅ Prisma Client gerado com sucesso.');
  } catch (err) {
    logger.error(`❌ Falha ao gerar o Prisma: ${err.message}`);
    throw err;
  }

  logger.success('\n🎉 Reset do monorepo concluído com sucesso! O ambiente está pronto.\n');
}

reset().catch(err => {
  logger.error(`\n🛑 Erro fatal durante o reset: ${err.message}`);
  process.exit(1);
});