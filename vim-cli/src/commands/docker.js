// vim-cli/src/commands/docker.js
import { select, checkbox } from '@inquirer/prompts';
import { execa } from 'execa';
import pc from 'picocolors';
import { MONOREPO_DIR, SERVICES } from '../config/paths.js';

/**
 * Orquestrador Docker (Controle Remoto).
 * Delega toda a complexidade de execução para os scripts NPM do monorepo.
 */
export async function manageDocker(currentEnv) {
  console.clear();
  console.log(pc.bgBlue(pc.white(pc.bold(' 🐳 ORQUESTRADOR DOCKER VIM \n'))));

  // 1. O que vamos orquestrar?
  const target = await select({
    message: 'O que você deseja orquestrar?',
    choices: [
      { name: '📦 Aplicação (Microserviços Node/Gateway)', value: 'app' },
      { name: '🗄️  Infraestrutura de Dados (Bancos PostgreSQL)', value: 'db' }
    ]
  });

  // 2. Qual é a ação?
  const action = await select({
    message: `Qual ação executar nos containers de ${target === 'app' ? 'Aplicação' : 'Banco de Dados'}?`,
    choices: [
      { name: '🟢 Subir (Up)', value: 'up' },
      { name: '🔴 Parar (Down)', value: 'down' },
      { name: '🔄 Recriar/Resetar (Rebuild/Reset)', value: target === 'app' ? 'rebuild' : 'reset' },
      { name: '📋 Acompanhar Logs', value: 'logs' }
    ]
  });

  // 3. Define as opções baseadas no alvo (App usa a pasta, DB usa o nome do perfil)
  const availableServices = target === 'app'
    ? SERVICES.map(s => ({ name: s.folder, value: s.folder }))
    : SERVICES.filter(s => s.hasDb).map(s => ({ name: `${s.name}-db`, value: s.name }));

  // 4. Pergunta o escopo
  const scope = await select({
    message: 'Em qual escopo?',
    choices: [
      { name: '🌟 Todos os serviços', value: 'all' },
      { name: '🎯 Escolher serviços específicos', value: 'specific' }
    ]
  });

  let selectedTargets = [];
  if (scope === 'specific') {
    selectedTargets = await checkbox({
      message: 'Selecione os alvos (Use espaço para marcar):',
      choices: availableServices
    });
    
    if (selectedTargets.length === 0) {
      console.log(pc.yellow('\nNenhum serviço selecionado. Operação cancelada.'));
      return;
    }
  }

  // 5. Mapeia para os scripts que criamos no package.json do Monorepo
  const npmScriptBase = target === 'app' ? 'docker' : 'db';

  console.log(pc.cyan(`\nRedirecionando execução para o Monorepo Vivere...\n`));

  try {
    if (scope === 'all') {
      // Ex: npm run docker:up
      await execa('npm', ['run', `${npmScriptBase}:${action}`], {
        cwd: MONOREPO_DIR,
        stdio: 'inherit' // Permite que logs, cores e barras de progresso do Docker apareçam nativamente
      });
    } else {
      for (const srv of selectedTargets) {
        // Ex: npm run db:up auth
        console.log(pc.dim(`\n➜ Alvo: ${srv}`));
        await execa('npm', ['run', `${npmScriptBase}:${action}`, srv], {
          cwd: MONOREPO_DIR,
          stdio: 'inherit'
        });
      }
    }
    console.log(pc.green(`\n✅ Operação Docker finalizada com absoluto sucesso!`));
  } catch (error) {
    console.log(pc.red(`\n❌ A operação Docker falhou ou foi interrompida (Código: ${error.exitCode || 1}).`));
  }
}