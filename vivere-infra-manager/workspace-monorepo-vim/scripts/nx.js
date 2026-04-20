#!/usr/bin/env node
// scripts/nx.js
/**
 * Wrapper inteligente para execução de comandos Nx.
 * Simplifica a sintaxe do dia a dia e garante o repasse correto de exit codes para CI/CD.
 */
const { exec } = require('./common/executor');
const logger = require('./common/logger');

const VALID_COMMANDS = ['build', 'serve', 'test', 'lint', 'format'];

function showHelp() {
  logger.info('\n🛠️  Vivere Nx Wrapper');
  logger.info('Uso: node scripts/nx.js <comando> [serviço]\n');
  logger.info('Comandos disponíveis:');
  
  VALID_COMMANDS.forEach(cmd => {
    logger.info(`  ➜ ${cmd}`);
  });
  
  console.log('\nExemplos:');
  console.log('  node scripts/nx.js build auth-service    (Faz o build apenas do Auth)');
  console.log('  node scripts/nx.js test                  (Roda os testes de TODOS os projetos)');
  console.log('  node scripts/nx.js format                (Aplica o Prettier em todo o monorepo)\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  // Se não passou argumentos ou pediu help explicitamente
  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const command = args[0];
  const service = args[1]; // Opcional (ex: auth-service, api-gateway, shared-domain)

  // Validação estrita do comando contra a nossa lista permitida
  if (!VALID_COMMANDS.includes(command)) {
    logger.error(`❌ Comando Nx inválido: "${command}"`);
    showHelp();
    process.exit(1);
  }

  // Construção dinâmica dos argumentos para o Nx
  let nxArgs = ['nx'];
  
  if (service) {
    // Alvo específico (ex: npx nx run auth-service:build)
    nxArgs.push('run', `${service}:${command}`);
    logger.info(`🎯 Executando alvo específico: ${service} ➜ ${command}`);
  } else {
    // Todos os projetos
    if (command === 'format') {
      nxArgs.push('format:write');
      logger.info('🧹 Formatando código de todo o workspace...');
    } else {
      nxArgs.push('run-many', '-t', command);
      logger.info(`🌐 Executando "${command}" em todos os projetos do workspace...`);
    }
  }

  try {
    // Como o executor já usa stdio: 'inherit', a saída colorida nativa do Nx
    // e as barras de progresso vão aparecer perfeitamente no terminal.
    await exec('npx', nxArgs);
    logger.success(`\n✅ Nx "${command}" finalizado com sucesso!`);
  } catch (err) {
    // O Nx já cospe o log de erro no terminal.
    // A nossa responsabilidade aqui é apenas repassar o exitCode correto para não quebrar silenciosamente no CI/CD.
    const exitCode = err.code || 1;
    logger.error(`\n❌ O comando Nx falhou (Código de saída: ${exitCode}). Veja os logs acima.`);
    process.exit(exitCode);
  }
}

main();