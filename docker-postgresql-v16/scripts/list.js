#!/usr/bin/env node
// scripts/list.js
/**
 * Lista todos os containers de banco de dados e seus respectivos status de saúde.
 * Utiliza "docker inspect" para buscar informações detalhadas e exibe em formato tabular.
 */
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { PROFILES, getContainerName } = require('./common/config');

async function getContainerStatus(profile) {
  const container = getContainerName(profile);
  
  try {
    // Usamos stdio: 'pipe' para o executor.js capturar a saída sem jogá-la solta no terminal
    // O docker inspect nos permite extrair o Status e o Health de uma vez só usando templates Go
    const { stdout } = await exec(
      'docker', 
      [
        'inspect', 
        '--format="{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}"', 
        container
      ], 
      { stdio: 'pipe' }
    );
    
    // O inspect vai nos retornar algo como "running|healthy" ou "exited|none"
    // Removemos aspas duplas residuais e quebras de linha que possam vir no stdout
    const cleanOutput = stdout.replace(/"/g, '').trim();
    const [status, health] = cleanOutput.split('|');
    
    return { 
      status: status || 'unknown', 
      health: health ? health.trim() : 'none' 
    };
  } catch (err) {
    // Se o docker inspect falhar (exit code !== 0), significa que o container não existe
    return { status: 'not found', health: 'none' };
  }
}

async function main() {
  logger.info('📋 Status dos bancos de dados locais:\n');
  
  // Descobre qual é o nome de perfil mais longo para alinhar as colunas bonitinho
  const maxLength = Math.max(...PROFILES.map(p => p.length));

  for (const profile of PROFILES) {
    const { status, health } = await getContainerStatus(profile);
    
    // Define a cor e o ícone com base no status real do container
    let icon = '🔴'; // Padrão: offline ou not found
    if (status === 'running') {
      icon = health === 'healthy' ? '🟢' : '🟡'; // Verde se saudável, Amarelo se starting/unhealthy
    }

    // Formatação de tabela
    const paddedProfile = profile.padEnd(maxLength, ' ');
    const statusText = status.padEnd(10, ' ');
    const healthText = health !== 'none' ? `(health: ${health})` : '';

    console.log(`  ${icon}  ${paddedProfile}  ➜  ${statusText} ${healthText}`);
  }
  
  console.log('\n💡 Legenda: 🟢 Saudável | 🟡 Iniciando/Sem Healthcheck | 🔴 Fora do ar / Não encontrado');
}

main().catch(err => {
  logger.error(`❌ Erro fatal ao listar containers: ${err.message}`);
  process.exit(1);
});