// scripts/common/executor.js
/**
 * Módulo central de execução de comandos (Turbinado).
 * Lida com processos paralelos, captura de output do terminal e retries automáticos.
 */
const { spawn } = require('child_process');
const logger = require('./logger');

/**
 * Executa um comando no shell e retorna uma Promise com o stdout/stderr.
 * * @param {string} command - Comando principal (ex: 'docker')
 * @param {string[]} args - Array de argumentos (ex: ['compose', 'up'])
 * @param {import('child_process').SpawnOptions} options - Opções extras do Node
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function exec(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    // Monta o comando completo apenas para exibição no log de debug
    const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
    logger.debug(`Executando: ${fullCommand}`);

    // Cria o processo filho. 
    // Usamos shell: true por padrão para suportar Windows e operadores de redirecionamento (>, <)
    const child = spawn(command, args, {
      stdio: options.stdio || 'inherit', // 'inherit' joga no terminal, 'pipe' permite capturar
      shell: true, 
      ...options,
    });

    let stdout = '';
    let stderr = '';

    // Se estivermos em modo 'pipe', capturamos o que o comando cospe no terminal
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

    // Aguarda o processo terminar
    child.on('close', (code) => {
      if (code === 0) {
        // Sucesso! Retorna o output limpo (sem quebras de linha extras no final)
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      } else {
        // Falha! Monta um erro rico em detalhes
        const error = new Error(`Comando falhou com código ${code}: ${fullCommand}`);
        error.code = code;
        error.stdout = stdout.trim();
        error.stderr = stderr.trim();
        reject(error);
      }
    });

    // Trata erros a nível de sistema (ex: comando não encontrado)
    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Executa um comando com retry automático em caso de falha temporária.
 * Excelente para aguardar o banco levantar antes de rodar seeds.
 * * @param {string} command 
 * @param {string[]} args 
 * @param {object} options 
 * @param {number} maxRetries 
 * @param {number} delayMs 
 */
async function execWithRetry(command, args = [], options = {}, maxRetries = 3, delayMs = 5000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      if (i > 1) logger.info(`▶ Tentativa ${i}/${maxRetries}: ${command} ${args.join(' ')}`);
      
      // Se funcionar, retorna imediatamente e encerra o loop
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