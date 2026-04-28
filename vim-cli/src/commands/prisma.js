// vim-cli/src/commands/prisma.js
import { select, confirm } from '@inquirer/prompts';
import { execa } from 'execa';
import pc from 'picocolors';
import { MONOREPO_DIR, SERVICES } from '../config/paths.js';

/**
 * Gerenciador Prisma (Controle Remoto).
 * Aciona os wrappers seguros do monorepo, evitando manipulação direta de arquivos ou contêineres pela CLI.
 */
export async function prismaMenu() {
  console.clear();
  console.log(pc.bgBlue(pc.white(pc.bold(' 🗄️  GERENCIADOR PRISMA VIM \n'))));

  // Filtra apenas os serviços que possuem banco de dados (ignorando o gateway)
  const dbServices = SERVICES.filter(s => s.hasDb);
  
  const serviceName = await select({
    message: 'Selecione o microserviço para gerenciar os dados:',
    choices: dbServices.map(s => ({ name: s.name, value: s.name }))
  });

  const action = await select({
    message: `Ações disponíveis para ${pc.cyan(serviceName)}:`,
    choices: [
      { name: '🔄 Generate (Atualizar tipagens no código)', value: 'generate' },
      { name: '⬆️  Migrate Dev (Aplicar schema no banco local)', value: 'migrate' },
      { name: '🚀 Migrate Deploy (Aplicar migrations pendentes)', value: 'deploy' },
      { name: '🌐 Studio (Visualizar dados no navegador)', value: 'studio' },
      { name: pc.bgRed(pc.white(' 💥 HARD RESET (Destruir banco e recriar) ')), value: 'reset' }
    ]
  });

  try {
    if (action === 'reset') {
      // 🚨 Trava de Segurança Crítica mantida na UI
      const isSure = await confirm({ 
        message: pc.red(`PERIGO: Isso irá APAGAR TODOS OS DADOS do banco de ${pc.bold(serviceName)}. Tem certeza absoluta?`) 
      });

      if (!isSure) {
        console.log(pc.yellow('\nOperação cancelada. Seus dados estão a salvo.'));
        return;
      }

      console.log(pc.cyan(`\nIniciando destruição e recriação do banco via infraestrutura central...`));
      
      // 1. Chama o script de reset blindado do banco de dados (que apaga volumes, dá retry e sobe de novo)
      await execa('npm', ['run', 'db:reset', serviceName], { cwd: MONOREPO_DIR, stdio: 'inherit' });
      
      // 2. Pergunta se já quer rodar as migrations no banco recém-criado
      const runMigrate = await confirm({ message: '\nDeseja aplicar as migrations do Prisma neste banco limpo agora?' });
      if (runMigrate) {
        console.log(pc.cyan(`\nAplicando migrations...`));
        await execa('npm', ['run', 'prisma:migrate', serviceName], { cwd: MONOREPO_DIR, stdio: 'inherit' });
      }
      
      console.log(pc.green('\n✅ Hard Reset concluído com sucesso!'));
      
    } else {
      console.log(pc.cyan(`\nRedirecionando comando Prisma para o Monorepo...\n`));
      
      // Os demais comandos mapeiam diretamente para os nossos scripts NPM (ex: npm run prisma:generate auth)
      await execa('npm', ['run', `prisma:${action}`, serviceName], { 
        cwd: MONOREPO_DIR, 
        stdio: 'inherit' 
      });
      
      console.log(pc.green(`\n✅ Operação Prisma (${action}) finalizada com sucesso!`));
    }
  } catch (error) {
    console.log(pc.red(`\n❌ A operação Prisma falhou (Código de saída: ${error.exitCode || 1}). Verifique os logs acima.`));
  }
}