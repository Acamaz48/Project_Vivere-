// vim-cli/src/commands/setup.js
import { execa } from 'execa';
import pc from 'picocolors';
import { MONOREPO_DIR } from '../config/paths.js';

/**
 * Aciona o Assistente de Setup Oficial do Monorepo Vivere.
 * Atua apenas como um "Controle Remoto", delegando a inteligência para a infraestrutura real.
 */
export async function runSetupWizard() {
  console.clear();
  console.log(pc.bgBlue(pc.white(pc.bold(' 🪄  INICIANDO ASSISTENTE DE SETUP VIM \n'))));
  console.log(pc.cyan('Redirecionando o controle para o Setup Oficial do Monorepo...\n'));

  try {
    // A mágica acontece aqui: 'stdio: inherit' faz com que as perguntas interativas 
    // do monorepo (readline) apareçam e funcionem perfeitamente dentro deste painel.
    await execa('npm', ['run', 'setup'], { 
      cwd: MONOREPO_DIR, 
      stdio: 'inherit' 
    });
    
    console.log(pc.green('\n✅ Setup finalizado. Controle retornado ao Painel VIM.'));
  } catch (error) {
    // O próprio script do monorepo já exibe os erros detalhados.
    // Nossa função aqui é apenas não deixar a CLI principal quebrar (*crash*).
    console.log(pc.red(`\n❌ O Setup do Monorepo foi interrompido ou falhou (Código: ${error.exitCode || 1}).`));
  }
}