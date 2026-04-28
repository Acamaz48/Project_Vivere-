// vim-cli/src/utils/logger.js
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import pc from 'picocolors';
import { LOGS_DIR } from '../config/paths.js';

/**
 * Executa um comando em background e salva a saída (logs) em um arquivo.
 * Ideal para rodar os servidores NestJS sem bloquear a interface do CLI.
 */
export async function spawnBackgroundProcess(name, command, args, cwd, envContext) {
  // 1. Cria a pasta de logs separada por ambiente (ex: logs/development/)
  const targetLogDir = path.join(LOGS_DIR, envContext);
  await fs.ensureDir(targetLogDir); // Garante que a pasta exista (cria se não existir)

  // 2. Cria o nome do arquivo com timestamp para não sobrescrever logs antigos
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(targetLogDir, `${name}-${timestamp}.log`);
  
  // 3. Abre um stream de gravação
  const writeStream = fs.createWriteStream(logFile, { flags: 'a' });

  // 4. Inicia o processo com Execa. Passamos o SEED_ENV para o processo filho herdar o ambiente.
  const subprocess = execa(command, args, { 
    cwd, 
    env: { ...process.env, SEED_ENV: envContext } 
  });

  // 5. Redireciona tudo que o serviço "falar" no terminal para o arquivo de texto
  subprocess.stdout.pipe(writeStream);
  subprocess.stderr.pipe(writeStream);

  // 6. Feedback visual para o desenvolvedor
  console.log(`\n${pc.green('✔')} Serviço ${pc.bold(pc.cyan(name))} iniciado em background.`);
  console.log(`${pc.dim('↳ Acompanhe os logs no arquivo:')} ${logFile}\n`);

  // 7. Desconecta o processo do Node.js atual. Isso permite que o nosso Menu CLI
  // continue funcionando perfeitamente enquanto a API roda escondida.
  subprocess.unref(); 
}