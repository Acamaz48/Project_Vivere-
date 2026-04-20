// vim-cli/src/commands/env.js
import fs from 'fs/promises';
import path from 'path';
import { select } from '@inquirer/prompts';
import { execa } from 'execa';
import pc from 'picocolors';
import { MONOREPO_DIR, SERVICES } from '../config/paths.js';

/**
 * Gerenciador de Variáveis de Ambiente.
 * Verifica a existência do .env, cria a partir do exemplo se necessário e tenta abrir no editor.
 * Totalmente reescrito com fs nativo (sem fs-extra).
 */
export async function manageEnv() {
  console.clear();
  console.log(pc.bgBlue(pc.white(pc.bold(' ⚙️  GERENCIADOR DE VARIÁVEIS (.env) \n'))));

  // 1. Menu Interativo para escolher o microserviço
  const serviceObj = await select({
    message: 'Escolha o microserviço para gerenciar o .env:',
    // Usa o nosso mapeamento rico do paths.js para saber exatamente o nome da pasta
    choices: SERVICES.map(s => ({ name: s.folder, value: s }))
  });

  const envPath = path.join(MONOREPO_DIR, 'apps', 'backend', serviceObj.folder, '.env');
  const envExamplePath = path.join(MONOREPO_DIR, 'apps', 'backend', serviceObj.folder, '.env.example');

  // 2. Lógica de Validação e Criação
  try {
    // Tenta acessar o ficheiro .env. Se não der erro, ele existe.
    await fs.access(envPath);
    console.log(`\n${pc.green('✔')} O arquivo .env de ${pc.cyan(serviceObj.folder)} já existe e está pronto.`);
  } catch {
    // Se o .env não existe, entramos no bloco de criação
    console.log(`\n${pc.yellow('⚠')} Arquivo .env não encontrado para ${pc.cyan(serviceObj.folder)}.`);
    
    try {
      // Tenta achar o .env.example para clonar
      await fs.access(envExamplePath);
      await fs.copyFile(envExamplePath, envPath);
      console.log(`${pc.green('✔')} Arquivo .env gerado automaticamente a partir do .env.example!`);
    } catch {
      // Falback Inteligente: Se não tem .env.example, cria um do zero já com o nome do banco certo!
      // Ex: auth-service -> auth_db
      const defaultDbName = serviceObj.hasDb ? `${serviceObj.name.replace('-', '_')}_db` : 'postgres';
      const defaultContent = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/${defaultDbName}?schema=public"\n`;
      
      await fs.writeFile(envPath, defaultContent);
      console.log(`${pc.green('✔')} Arquivo .env em branco gerado com a string de conexão padrão (${defaultDbName}).`);
    }
  }

  // 3. Abertura Assistida no Editor (VS Code)
  console.log(`\n${pc.blue('ℹ')} Tentando abrir o arquivo no seu editor (VS Code)...`);
  try {
    // shell: true é essencial no Windows para que o Node encontre o comando 'code' no PATH global
    await execa('code', [envPath], { shell: true });
    console.log(`${pc.green('✔')} Arquivo aberto no VS Code com sucesso!`);
  } catch (e) {
    console.log(`${pc.yellow('⚠')} Não foi possível abrir o VS Code automaticamente.`);
    console.log(`Por favor, abra manualmente o caminho abaixo na sua IDE:\n${pc.dim(envPath)}`);
  }
}