#!/usr/bin/env node
// run.js (Nível Raiz)
/**
 * Vivere Global Router.
 * Atua como o maestro principal do projeto, roteando comandos para o CLI, 
 * Monorepo ou Infraestrutura de Banco de Dados de forma transparente.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve caminhos absolutos no formato moderno (ES Modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Nossos três grandes pilares arquiteturais
const CLI_DIR = path.join(__dirname, 'vim-cli');
const MONOREPO_DIR = path.join(__dirname, 'workspace-monorepo-vim');
const DB_DIR = path.join(__dirname, 'docker-postgresql-v16');

// Paleta de cores ANSI (Zero Dependências)
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[90m'
};

const args = process.argv.slice(2);

/**
 * Função utilitária que executa comandos de forma segura e elegante.
 */
function runCommand(commandArray, targetDir) {
  if (commandArray.length === 0) {
    console.error(`${colors.red}❌ Nenhum comando informado após o prefixo.${colors.reset}`);
    process.exit(1);
  }

  const [cmd, ...cmdArgs] = commandArray;
  
  console.log(`${colors.cyan}\n🚀 Executando: ${colors.green}${cmd} ${cmdArgs.join(' ')}${colors.reset}`);
  console.log(`${colors.dim}📁 Alvo: ${targetDir}${colors.reset}\n`);

  const result = spawnSync(cmd, cmdArgs, {
    cwd: targetDir,
    stdio: 'inherit',
    shell: true // Essencial para cross-platform (Windows/Mac/Linux)
  });

  if (result.status !== 0) {
    console.error(`${colors.red}\n❌ Comando finalizado com erro (Código: ${result.status}).${colors.reset}`);
    process.exit(result.status || 1);
  }
}

// ============================================================================
// 1. MODO: INTERFACE GRÁFICA (TUI)
// Ex: "node run" -> Inicia o Painel de Controle (VIM CLI)
// ============================================================================
if (args.length === 0) {
  const cliNodeModules = path.join(CLI_DIR, 'node_modules');
  
  // Auto-instalação da CLI se for a primeira vez
  if (!fs.existsSync(cliNodeModules)) {
    console.log(`${colors.yellow}📦 Primeira execução detectada! Instalando dependências do Painel VIM...${colors.reset}`);
    spawnSync('npm', ['install'], { cwd: CLI_DIR, stdio: 'inherit', shell: true });
    console.log(`${colors.green}✅ Dependências do painel instaladas!\n${colors.reset}`);
  }

  spawnSync('node', ['index.js'], { cwd: CLI_DIR, stdio: 'inherit' });
  process.exit(0);
}

// ============================================================================
// 2. MODO: ROTEADOR DE TERMINAL
// ============================================================================
const prefix = args[0];

switch (prefix) {
  case 'setup':
    // Atalho direto para o nosso novo setup proxy
    runCommand(['node', 'setup.js'], __dirname);
    break;

  case 'db':
    // Roteia para a infraestrutura do banco de dados (Ex: node run db npm run db:backup)
    // Note que agora a CLI principal de dados vive no monorepo, mas mantemos o fallback
    runCommand(args.slice(1), DB_DIR);
    break;

  case 'mono':
    // Roteia para a raiz do monorepo (Ex: node run mono npm run format)
    runCommand(args.slice(1), MONOREPO_DIR);
    break;

  case 'svc':
    // Roteia comandos CIRÚRGICOS dentro de um microserviço
    // Ex: node run svc auth npm install bcrypt
    const serviceName = args[1];
    if (!serviceName) {
      console.error(`${colors.red}❌ Informe o nome do serviço. Ex: node run svc identity npm install${colors.reset}`);
      process.exit(1);
    }

    // Inteligência para deduzir o nome da pasta (com ou sem '-service')
    const appFolder = (serviceName === 'api-gateway' || serviceName === 'gateway') 
      ? 'api-gateway' 
      : `${serviceName.replace('-service', '')}-service`;

    const svcPath = path.join(MONOREPO_DIR, 'apps/backend', appFolder);

    if (!fs.existsSync(svcPath)) {
      console.error(`${colors.red}❌ Diretório do serviço não encontrado: ${svcPath}${colors.reset}`);
      process.exit(1);
    }

    runCommand(args.slice(2), svcPath);
    break;

  default:
    // FALLBACK: Presume que é um comando para o monorepo
    // Ex: node run npm run build -> Roda no workspace-monorepo-vim
    runCommand(args, MONOREPO_DIR);
    break;
}