#!/usr/bin/env node
// scripts/cli.js
/**
 * CLI unificada para orquestração dos bancos de dados locais.
 * Serve como ponto de entrada único para todos os scripts de manutenção.
 */
const path = require('path');
const { exec } = require('./common/executor');
const logger = require('./common/logger');

// Mapeamento de comandos disponíveis e suas descrições para um help amigável
const COMMANDS = {
  backup: 'Gera um dump (.sql) de um ou todos os bancos',
  restore: 'Restaura um banco a partir de um backup existente (Interativo)',
  reset: 'Derruba containers, apaga volumes físicos e sobe tudo do zero',
  clean: 'Apaga fisicamente os diretórios de dados locais',
  seed: 'Roda os scripts .sql de carga inicial (seeds)',
  healthcheck: 'Verifica se um banco está pronto para aceitar conexões',
  list: 'Exibe o status e healthcheck de todos os containers de banco'
};

function showHelp() {
  logger.info('\n🛠️  Vivere Infra Manager - CLI de Banco de Dados');
  logger.info('Uso: node scripts/cli.js <comando> [perfil | "all"]\n');
  logger.info('Comandos disponíveis:');
  
  // Encontra o comando mais longo para alinhar a tabela perfeitamente
  const maxCmdLength = Math.max(...Object.keys(COMMANDS).map(c => c.length));
  
  for (const [cmd, desc] of Object.entries(COMMANDS)) {
    const paddedCmd = cmd.padEnd(maxCmdLength, ' ');
    logger.info(`  ${paddedCmd}  ➜  ${desc}`);
  }
  
  console.log('\nExemplos:');
  console.log('  node scripts/cli.js list');
  console.log('  node scripts/cli.js reset all');
  console.log('  node scripts/cli.js backup auth');
}

async function main() {
  const args = process.argv.slice(2);
  
  // Se não passou argumentos ou pediu help explicitamente
  if (args.length === 0 || ['help', '--help', '-h'].includes(args[0])) {
    showHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const [command, ...rest] = args;
  
  // Valida se o comando existe na nossa lista oficial
  if (!Object.keys(COMMANDS).includes(command)) {
    logger.error(`❌ Comando desconhecido: "${command}"`);
    showHelp();
    process.exit(1);
  }

  const scriptPath = path.join(__dirname, `${command}.js`);
  
  try {
    // Monta o comando completo. 
    // Como o executor.js usa stdio: 'inherit' por padrão e shell: true,
    // os prompts interativos (como os do restore.js) e as cores ANSI funcionarão perfeitamente.
    const argsString = rest.length > 0 ? ` ${rest.join(' ')}` : '';
    await exec(`node "${scriptPath}"${argsString}`);
  } catch (err) {
    // Se o script filho (ex: restore.js) falhar, repassamos o exit code dele para o S.O.
    const exitCode = err.code || 1;
    logger.error(`❌ O comando "${command}" finalizou com erro.`);
    process.exit(exitCode);
  }
}

main();