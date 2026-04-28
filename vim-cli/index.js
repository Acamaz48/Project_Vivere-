// vim-cli/index.js
import { select } from '@inquirer/prompts';
import Table from 'cli-table3';
import { execa } from 'execa';
import pc from 'picocolors';
import readline from 'readline';

import { runSetupWizard } from './src/commands/setup.js';
import { runNxServices } from './src/commands/nx.js';
import { manageEnv } from './src/commands/env.js';
import { manageDocker } from './src/commands/docker.js';
import { prismaMenu } from './src/commands/prisma.js';
import { SERVICES } from './src/config/paths.js';

let currentEnv = 'development';
let isLiveMonitoring = false;

async function getDockerStatus() {
  try {
    const { stdout } = await execa('docker', ['ps', '-a', '--format', '{{.Names}}||{{.Status}}||{{.Ports}}']);
    return stdout.split('\n').filter(Boolean).map(line => {
      const [name, status, ports] = line.split('||');
      return { name, status, ports: ports || 'N/A' };
    });
  } catch {
    return [];
  }
}

async function renderDashboardTable() {
  const containers = await getDockerStatus();
  
  console.log(pc.cyan('╔════════════════════════════════════════════════════════════════════════════╗'));
  console.log(pc.cyan('║') + pc.bold(pc.white('                           🚀 VIVERE INFRA MANAGER                           ')) + pc.cyan('║'));
  console.log(pc.cyan('╠════════════════════════════════════════════════════════════════════════════╣'));
  console.log(pc.cyan('║') + ` Contexto de Execução: ${pc.bgMagenta(pc.white(` ${currentEnv.toUpperCase()} `))}`.padEnd(85) + pc.cyan('║'));
  console.log(pc.cyan('╚════════════════════════════════════════════════════════════════════════════╝\n'));

  if (containers.length > 0) {
    const table = new Table({
      head: [pc.bold('Container'), pc.bold('Status / Health'), pc.bold('Portas')],
      style: { head: ['cyan'], border: ['gray'] }
    });
    
    containers.forEach(c => {
      if (c.name.endsWith('-db') || c.name.endsWith('-service') || c.name === 'api-gateway') {
        const isUp = c.status.includes('Up');
        let visualStatus = isUp ? pc.green(c.status) : pc.red(c.status);
        if (c.status.includes('(healthy)')) visualStatus = pc.green(pc.bold('Up (Saudável)'));
        
        table.push([c.name, visualStatus, pc.dim(c.ports.split(',')[0].substring(0, 30))]);
      }
    });
    
    if (table.length > 0) {
       console.log(pc.bold('📊 Tela Viva - Status da Infraestrutura:'));
       console.log(table.toString());
       console.log();
    }
  } else {
    console.log(pc.yellow('⚠️  Nenhum container do VIM detectado rodando no momento.\n'));
  }
}

async function startLiveMonitor() {
  isLiveMonitoring = true;
  
  process.stdout.write('\x1B[?25l'); 
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const keyHandler = (str, key) => {
    if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      isLiveMonitoring = false;
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.removeListener('keypress', keyHandler);
      process.stdout.write('\x1B[?25h'); 
    }
  };
  process.stdin.on('keypress', keyHandler);

  while (isLiveMonitoring) {
    console.clear();
    await renderDashboardTable();
    console.log(pc.dim('🔄 Atualizando em tempo real... Pressione [Q] ou [ESC] para voltar ao menu.'));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await mainMenu();
}

async function mainMenu() {
  console.clear();
  await renderDashboardTable();

  const action = await select({
    message: 'Painel de Orquestração - Escolha uma ação:',
    choices: [
      { name: pc.bgBlue(pc.white(pc.bold(' 🪄  Executar Setup Completo (Aciona o Monorepo) '))), value: 'setup' },
      { name: '📺 Abrir Tela Viva (Monitoramento em Tempo Real)', value: 'monitor' },
      { name: '🌐 Orquestrar Bancos de Dados Isolados (Docker)', value: 'docker' },
      { name: '🚀 Iniciar Microserviços Isolados (Nx Serve)', value: 'nx' },
      { name: '🗄️  Gerenciar Prisma & Dados (Migrate/Reset)', value: 'prisma' },
      { name: '⚙️  Gerenciar Variáveis de Ambiente (.env)', value: 'env' },
      { name: '🚪 Sair do Painel', value: 'exit' },
    ],
    pageSize: 8
  });

  switch (action) {
    case 'setup':
      await runSetupWizard();
      await pause();
      break;
    case 'monitor':
      await startLiveMonitor();
      return; 
    case 'docker':
      await manageDocker(currentEnv);
      await pause();
      break;
    case 'nx':
      await runNxServices(currentEnv);
      await pause();
      break;
    case 'prisma':
      await prismaMenu(currentEnv);
      await pause();
      break;
    case 'env':
      await manageEnv();
      await pause();
      break;
    case 'exit':
      console.log(pc.green('\nEncerrando VIM CLI de forma segura. Volte sempre! 👋\n'));
      process.exit(0);
  }

  await mainMenu();
}

async function pause() {
  await select({
    message: 'Operação concluída. Pressione [Enter] para retornar ao Menu...',
    choices: [{ name: 'Voltar', value: 'back' }]
  });
}

mainMenu().catch(err => {
  if (err.name === 'ExitPromptError') {
    console.log(pc.dim('\nOperação cancelada pelo usuário. Saindo...'));
  } else {
    console.error(pc.red('\nErro fatal na CLI:'), err);
  }
  process.exit(1);
});