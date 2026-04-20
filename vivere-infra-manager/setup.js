#!/usr/bin/env node
// setup.js (Nível Raiz)
/**
 * Proxy de Setup e Ponto de Entrada.
 * Delega a inicialização pesada para o Assistente Oficial do Monorepo Vivere e,
 * ao final, oferece a transição imediata para o Painel de Controle (VIM CLI).
 */
const { spawnSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const MONOREPO_DIR = path.join(__dirname, 'workspace-monorepo-vim');

// Cores ANSI nativas para o terminal
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

console.log(`${cyan}\n🚀 Redirecionando para o Setup Oficial do Ecossistema Vivere...${reset}\n`);

// 1. Aciona o script robusto (Zero-Dep) que configuramos no monorepo
const result = spawnSync('npm', ['run', 'setup'], {
  cwd: MONOREPO_DIR,
  stdio: 'inherit',
  shell: true // Necessário no Windows
});

// 2. Transição Elegante: Se o setup deu certo, convida o Dev para o Painel VIM
if (result.status === 0) {
  console.log(`${green}\n✅ Operação de Setup global finalizada com sucesso.${reset}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`${yellow}`); // Muda a cor da pergunta
  rl.question('📺 Deseja abrir o Painel de Controle (VIM CLI) agora? (S/n): ', (answer) => {
    rl.close();
    console.log(`${reset}`);
    
    // Se ele não digitar 'n' (ou seja, apertar Enter ou 'S'), abrimos a CLI
    if (answer.trim().toLowerCase() !== 'n') {
      console.log(`${cyan}Iniciando a Interface do Vivere Infra Manager...${reset}\n`);
      
      // Chama o nosso roteador global (run.js) sem argumentos.
      // O run.js já tem a inteligência de instalar o vim-cli se for a primeira vez e abrir o painel!
      spawnSync('node', ['run.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
      });
    } else {
      console.log(`${green}Perfeito! Para abrir o painel depois, basta digitar: node run.js${reset}\n`);
    }
    process.exit(0);
  });
} else {
  // Se o setup falhou no meio do caminho, repassa o erro e não tenta abrir a CLI
  process.exit(result.status || 1);
}