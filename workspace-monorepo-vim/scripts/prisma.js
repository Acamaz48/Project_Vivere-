#!/usr/bin/env node
// scripts/prisma.js
/**
 * Wrapper inteligente para comandos do Prisma ORM integrados com o Nx.
 * Garante que os comandos de banco de dados rodem no escopo correto dos microserviços.
 */
const { exec } = require('./common/executor');
const logger = require('./common/logger');

// Dicionário de comandos, mapeando o atalho da CLI para o target real do Nx
const PRISMA_COMMANDS = {
  'generate': { 
    target: 'prisma-generate', 
    desc: 'Gera o Prisma Client baseado no schema.prisma' 
  },
  'migrate-dev': { 
    target: 'prisma-migrate-dev', 
    desc: 'Cria uma nova migration (dev) e aplica no banco local' 
  },
  'migrate-deploy': { 
    target: 'prisma-migrate-deploy', 
    desc: 'Aplica migrations pendentes (ideal para CI/CD ou Produção)' 
  },
  'studio': { 
    target: 'prisma-studio', 
    desc: 'Abre o Prisma Studio no navegador para inspecionar os dados' 
  }
};

function showHelp() {
  logger.info('\n🔺 Vivere Prisma Wrapper');
  logger.info('Uso: node scripts/prisma.js <comando> [serviço]\n');
  logger.info('Comandos disponíveis:');
  
  const maxCmdLength = Math.max(...Object.keys(PRISMA_COMMANDS).map(c => c.length));
  
  for (const [cmd, config] of Object.entries(PRISMA_COMMANDS)) {
    const paddedCmd = cmd.padEnd(maxCmdLength, ' ');
    logger.info(`  ➜ ${paddedCmd}  : ${config.desc}`);
  }
  
  console.log('\nExemplos:');
  console.log('  node scripts/prisma.js generate               (Gera o client para todos os serviços)');
  console.log('  node scripts/prisma.js migrate-dev auth       (Cria migration apenas no Auth Service)');
  console.log('  node scripts/prisma.js studio warehouse       (Abre o Studio do banco de Warehouse)\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const command = args[0];
  const service = args[1]; // Opcional (ex: auth, identity)

  const cmdConfig = PRISMA_COMMANDS[command];
  if (!cmdConfig) {
    logger.error(`❌ Comando Prisma inválido: "${command}"`);
    showHelp();
    process.exit(1);
  }

  // Montagem dinâmica dos argumentos para o Nx
  let nxArgs = ['nx'];
  
  if (service) {
    // Para rodar comandos Prisma via Nx, geralmente o nome do projeto bate com o diretório 
    // ou nome cadastrado no project.json (ex: auth-service). 
    // Se o desenvolvedor digitar apenas "auth", podemos assumir "auth-service" caso seja o seu padrão.
    // Aqui usamos exatamente o que foi digitado para manter a flexibilidade.
    const projectName = service.endsWith('-service') ? service : `${service}-service`;
    
    nxArgs.push('run', `${projectName}:${cmdConfig.target}`);
    logger.info(`🔺 Executando "${cmdConfig.target}" no microserviço: ${projectName}...`);
  } else {
    nxArgs.push('run-many', '-t', cmdConfig.target);
    logger.info(`🔺 Executando "${cmdConfig.target}" em todos os microserviços...`);
  }

  try {
    await exec('npx', nxArgs);
    logger.success(`\n✅ Comando Prisma "${command}" finalizado com sucesso!`);
  } catch (err) {
    const exitCode = err.code || 1;
    logger.error(`\n❌ Falha ao executar o Prisma via Nx (Código: ${exitCode}).`);
    process.exit(exitCode);
  }
}

main();