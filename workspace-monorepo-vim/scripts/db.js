#!/usr/bin/env node
// scripts/db.js
/**
 * Proxy Inteligente para a CLI de Banco de Dados.
 * Encaminha qualquer comando executado no monorepo diretamente para o 
 * maestro (cli.js) da infraestrutura de dados, mantendo a responsabilidade isolada.
 */
const path = require('path');
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { DB_INFRA_DIR } = require('./common/config');

async function main() {
  // Captura todos os argumentos passados no terminal (ex: "backup auth", "list", "reset all")
  const args = process.argv.slice(2);
  
  // Apontamos diretamente para a CLI unificada que criamos no projeto de infra
  const cliPath = path.join(DB_INFRA_DIR, 'scripts', 'cli.js');

  logger.debug(`Encaminhando para a infraestrutura de dados...`);

  try {
    // Como o nosso novo executor.js usa stdio: 'inherit' e shell: true, 
    // todas as cores, tabelas e menus interativos (como no restore) vão funcionar perfeitamente aqui!
    await exec(`node "${cliPath}"`, args);
  } catch (err) {
    // A própria cli.js do banco já lida com seus logs de erro de forma bonita.
    // Nossa única responsabilidade aqui é falhar o processo do monorepo com o mesmo exit code,
    // garantindo que pipelines de CI/CD não deem "falso positivo".
    process.exit(err.code || 1);
  }
}

main();