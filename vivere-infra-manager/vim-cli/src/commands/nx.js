// vim-cli/src/commands/nx.js
import { select, checkbox } from '@inquirer/prompts';
import { execa } from 'execa';
import pc from 'picocolors';
import { MONOREPO_DIR, SERVICES } from '../config/paths.js';
import { spawnBackgroundProcess } from '../utils/logger.js';

/**
 * Orquestrador Nx (Controle Remoto).
 * Aciona os scripts de build, serve, test e lint da aplicação.
 * Mantém o suporte premium para execução de servidores NestJS em background.
 */
export async function runNxServices(envContext) {
  console.clear();
  console.log(pc.bgBlue(pc.white(pc.bold(' 🚀 ORQUESTRADOR DE MICROSERVIÇOS (Nx) \n'))));

  // 1. Qual é a operação desejada?
  const action = await select({
    message: 'O que você deseja fazer com a aplicação NestJS/Gateway?',
    choices: [
      { name: '🟢 Iniciar Serviços (Serve)', value: 'serve' },
      { name: '🏗️  Construir (Build)', value: 'build' },
      { name: '🧪 Testar (Test)', value: 'test' },
      { name: '🧹 Validar Código (Lint)', value: 'lint' },
      { name: '✨ Formatar Código (Format)', value: 'format' }
    ]
  });

  // 2. Definir o escopo (Todos ou específicos)
  const scope = await select({
    message: 'Em qual escopo?',
    choices: [
      { name: '🌟 Todo o Workspace (run-many)', value: 'all' },
      { name: '🎯 Escolher microserviços específicos', value: 'specific' }
    ]
  });

  let selectedServices = [];
  if (scope === 'specific') {
    selectedServices = await checkbox({
      message: 'Selecione os serviços alvos (Use espaço para marcar):',
      // Mapeia usando a nova estrutura do paths.js
      choices: SERVICES.map(s => ({ name: s.folder, value: s.name })) 
    });

    if (selectedServices.length === 0) {
      console.log(pc.yellow('\nNenhum serviço selecionado. Operação cancelada.'));
      return;
    }
  }

  // 3. UX Avançada: Se for "serve" específico, permite rodar em background!
  let runInBackground = false;
  if (action === 'serve' && scope === 'specific') {
    runInBackground = await select({
      message: 'Como deseja executar os serviços?',
      choices: [
        { name: '🖥️  Foreground (Prende o terminal, mostra logs em tempo real)', value: false },
        { name: '👻 Background (Libera a CLI, salva logs em /logs)', value: true }
      ]
    });
  }

  console.log(pc.cyan(`\nDelegando execução (${action}) para o Monorepo Vivere...\n`));

  try {
    if (scope === 'all') {
      // Ex: npm run build
      // A CLI do monorepo já sabe que sem argumentos ela deve rodar o run-many
      await execa('npm', ['run', action], { cwd: MONOREPO_DIR, stdio: 'inherit' });
    } else {
      for (const service of selectedServices) {
        if (runInBackground) {
          // Mantemos a tua lógica genial de background, mas delegando para o npm script
          await spawnBackgroundProcess(
            service, 
            'npm', 
            ['run', action, service], // Ex: npm run serve auth
            MONOREPO_DIR, 
            envContext
          );
        } else {
          console.log(pc.dim(`\n➜ Alvo: ${service}`));
          await execa('npm', ['run', action, service], { cwd: MONOREPO_DIR, stdio: 'inherit' });
        }
      }
    }

    if (!runInBackground) {
      console.log(pc.green(`\n✅ Operação Nx (${action}) concluída com absoluto sucesso!`));
    }
  } catch (error) {
    console.log(pc.red(`\n❌ A operação Nx falhou (Código: ${error.exitCode || 1}). Verifique os logs acima.`));
  }
}