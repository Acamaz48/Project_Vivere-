// scripts/common/executor.js
/**
 * Módulo central de execução de comandos (Turbinado).
 * Lida com processos paralelos, captura de output do terminal e retries automáticos.
 * Sincronizado com a infraestrutura de banco de dados.
 */
const { spawn } = require('child_process');
const logger = require('./logger');

/**
 * Executa um comando no shell e retorna uma Promise com o stdout/stderr.
 * @param {string} command - Comando principal (ex: 'nx')
 * @param {string[]} args - Array de argumentos (ex: ['run-many', '-t', 'build'])
 * @param {import('child_process').SpawnOptions} options - Opções extras do Node
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
function exec(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
    logger.debug(`Executando: ${fullCommand}`);

    const child = spawn(command, args, {
      stdio: options.stdio || 'inherit',
      shell: true, 
      ...options,
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code });
      } else {
        // Retorna um erro rico caso o comando falhe (exitCode != 0)
        // Isso permite que o chamador trate a falha graciosamente se quiser
        const error = new Error(`Comando falhou com código ${code}: ${fullCommand}`);
        error.code = code;
        error.stdout = stdout.trim();
        error.stderr = stderr.trim();
        reject(error);
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Executa um comando com retry automático em caso de falha temporária.
 */
async function execWithRetry(command, args = [], options = {}, maxRetries = 3, delayMs = 5000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      if (i > 1) logger.info(`▶ Tentativa ${i}/${maxRetries}: ${command} ${args.join(' ')}`);
      return await exec(command, args, options);
    } catch (err) {
      logger.error(`❌ Falha na tentativa ${i}: ${err.message}`);
      if (i === maxRetries) {
        logger.error(`🛑 Limite de ${maxRetries} tentativas excedido.`);
        throw err;
      }
      logger.warn(`⏳ Aguardando ${delayMs / 1000}s antes de tentar novamente...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = { exec, execWithRetry };