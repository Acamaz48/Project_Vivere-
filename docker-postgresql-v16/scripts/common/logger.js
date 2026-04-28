#!/usr/bin/env node
// scripts/common/logger.js
/**
 * Logger padronizado com cores ANSI e tratamento inteligente de Erros e Objetos.
 */
const util = require('util');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Formata os argumentos antes de logar.
 * Extrai stack traces de erros e formata objetos aninhados.
 */
function formatArgs(args) {
  return args.map(arg => {
    if (arg instanceof Error) {
      // Se DEBUG estiver ativo, mostra o rastro completo do erro.
      // Se não, mostra apenas a mensagem formatada para não poluir o terminal.
      return process.env.DEBUG && arg.stack ? arg.stack : arg.message;
    }
    if (typeof arg === 'object' && arg !== null) {
      // Formata objetos para não virarem [object Object]
      return util.inspect(arg, { depth: 4, colors: false });
    }
    return String(arg);
  });
}

function log(color, ...args) {
  const formattedArgs = formatArgs(args);
  // Usa o spread operator para manter o comportamento natural do console.log
  console.log(color + formattedArgs.join(' ') + colors.reset);
}

module.exports = {
  info: (...args) => log(colors.cyan, ...args),
  success: (...args) => log(colors.green, ...args),
  warn: (...args) => log(colors.yellow, ...args),
  error: (...args) => log(colors.red, ...args),
  debug: (...args) => {
    if (process.env.DEBUG) {
      log(colors.gray, '[DEBUG]', ...args);
    }
  },
};