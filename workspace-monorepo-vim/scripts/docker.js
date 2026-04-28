#!/usr/bin/env node
// scripts/docker.js
/**
 * Wrapper inteligente para gerenciamento dos contêineres da aplicação no monorepo.
 * Simplifica o uso do docker compose e padroniza a saída para os desenvolvedores.
 */
const { exec } = require('./common/executor');
const logger = require('./common/logger');

// Mapeamento dos comandos simplificados para os comandos reais do Docker Compose
const DOCKER_COMMANDS = {
  up: { args: ['up', '-d'], desc: 'Sobe todos os serviços (ou um específico) em background' },
  down: { args: ['down'], desc: 'Derruba todos os serviços' },
  logs: { args: ['logs', '-f'], desc: 'Exibe e acompanha os logs em tempo real' },
  ps: { args: ['ps'], desc: 'Lista o status dos contêineres da aplicação' },
  rebuild: { args: ['up', '-d', '--build'], desc: 'Força o rebuild da imagem e sobe o serviço' }
};

function showHelp() {
  logger.info('\n🐳 Vivere Docker App Wrapper');
  logger.info('Uso: node scripts/docker.js <comando> [serviço]\n');
  logger.info('Comandos disponíveis:');
  
  // Encontra o comando mais longo para alinhar o texto perfeitamente
  const maxCmdLength = Math.max(...Object.keys(DOCKER_COMMANDS).map(c => c.length));
  
  for (const [cmd, config] of Object.entries(DOCKER_COMMANDS)) {
    const paddedCmd = cmd.padEnd(maxCmdLength, ' ');
    logger.info(`  ➜ ${paddedCmd}  : ${config.desc}`);
  }
  
  console.log('\nExemplos:');
  console.log('  node scripts/docker.js up                   (Sobe toda a aplicação)');
  console.log('  node scripts/docker.js rebuild auth-service (Rebuilda apenas o Auth)');
  console.log('  node scripts/docker.js logs api-gateway     (Acompanha logs do Gateway)\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const command = args[0];
  const service = args[1]; // Opcional (ex: auth-service, api-gateway)

  // Validação do comando no nosso dicionário
  const cmdConfig = DOCKER_COMMANDS[command];
  if (!cmdConfig) {
    logger.error(`❌ Comando Docker inválido: "${command}"`);
    showHelp();
    process.exit(1);
  }

  // Constrói os argumentos reais (ex: ['compose', 'up', '-d', 'auth-service'])
  const composeArgs = ['compose', ...cmdConfig.args];
  
  if (service) {
    composeArgs.push(service);
    logger.info(`🐳 Executando "docker compose ${cmdConfig.args.join(' ')}" para: ${service}...`);
  } else {
    logger.info(`🐳 Executando "docker compose ${cmdConfig.args.join(' ')}" no workspace...`);
  }

  try {
    await exec('docker', composeArgs);
    logger.success(`\n✅ Comando "${command}" finalizado com sucesso!`);
  } catch (err) {
    // Repassa o código de erro exato do Docker para o SO
    const exitCode = err.code || 1;
    logger.error(`\n❌ Falha ao executar o Docker (Código: ${exitCode}).`);
    process.exit(exitCode);
  }
}

main();