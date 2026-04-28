#!/usr/bin/env node
// scripts/setup.js
/**
 * Vivere Enterprise Orchestrator - Setup Definitivo (Zero-Dep).
 * Prepara o ambiente local do desenvolvedor sem depender de pacotes externos.
 */
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('./common/executor');
const logger = require('./common/logger');
const { DB_INFRA_DIR, SERVICES } = require('./common/config');

// Interface nativa para perguntas no terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

/**
 * Utilitário para carregar variáveis de um arquivo .env para o process.env do Node
 */
function loadEnvFile(filePath) {
  try {
    if (!fsSync.existsSync(filePath)) return;
    
    const content = fsSync.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const [key, ...valParts] = trimmed.split('=');
      const value = valParts.join('=').trim();
      
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
    logger.debug(`📄 Variáveis carregadas de: ${path.basename(filePath)}`);
  } catch (err) {
    logger.warn(`⚠️ Não foi possível carregar ${filePath}: ${err.message}`);
  }
}

/**
 * Aguarda o banco de dados ficar pronto fazendo polling com pg_isready.
 */
async function waitForDatabaseReady(profile, containerName, timeout = 60000, interval = 2000) {
  const endTime = Date.now() + timeout;
  const dbUser = process.env.POSTGRES_USER || 'postgres';

  logger.info(`⏳ Aguardando o banco do perfil "${profile}" iniciar...`);

  while (Date.now() < endTime) {
    try {
      // Usamos reject: false para não estourar erro no executor enquanto o banco ainda estiver subindo
      const { exitCode, stdout } = await exec('docker', [
        'exec', containerName, 'pg_isready', '-U', dbUser
      ], { reject: false, stdio: 'pipe' });

      if (exitCode === 0) {
        logger.success(`✅ Banco "${profile}" está pronto para conexões!`);
        return;
      }
    } catch (error) {
      // Ignora erros de execução durante o polling
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout de ${timeout/1000}s excedido aguardando o container ${containerName}.`);
}

async function main() {
  logger.info('\n🚀 VIVERE ENTERPRISE ORCHESTRATOR - PLATINUM\n');

  // 1. Carrega variáveis de ambiente (Local e da Infra de Banco)
  loadEnvFile(path.resolve(__dirname, '..', '.env'));
  loadEnvFile(path.resolve(DB_INFRA_DIR, '.env'));

  // 2. Validações de pré-requisitos
  logger.info('🔎 Validando dependências do sistema...');
  try {
    await exec('docker', ['--version'], { stdio: 'pipe' });
    await exec('docker', ['compose', 'version'], { stdio: 'pipe' });
  } catch {
    logger.error('❌ Docker ou Docker Compose não encontrados. Por favor, instale-os antes de continuar.');
    process.exit(1);
  }

  // 3. Sincronização de Dependências (Delega para o nosso reset.js otimizado)
  logger.info('\n📦 Iniciando estabilização de dependências (NPM e Prisma)...');
  try {
    const resetScript = path.join(__dirname, 'reset.js');
    await exec('node', [resetScript]);
  } catch (err) {
    logger.error(`❌ Falha na sincronização de dependências.`);
    process.exit(1);
  }

  // 4. Menu Interativo: Ambiente
  logger.info('\n🌎 Escolha o Ambiente de Execução:');
  console.log('  1. development');
  console.log('  2. staging');
  console.log('  3. production');
  const envAnswer = await question('Digite a opção (1-3) [padrão: 1]: ');
  
  const envMap = { '1': 'development', '2': 'staging', '3': 'production' };
  const environment = envMap[envAnswer.trim()] || 'development';
  
  logger.success(`🌍 Ambiente definido como: ${environment}`);
  process.env.SEED_ENV = environment;

  // 5. Menu Interativo: Microserviços
  logger.info('\n🧩 Selecione os microserviços que deseja rodar:');
  SERVICES.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (${s.folder})`));

  const servicesAnswer = await question('\nDigite os números separados por vírgula ou "all": ');
  let selectedServices = [];
  
  if (servicesAnswer.trim().toLowerCase() === 'all') {
    selectedServices = SERVICES;
  } else {
    const indices = servicesAnswer.split(',').map(v => parseInt(v.trim()) - 1);
    selectedServices = indices.filter(i => i >= 0 && i < SERVICES.length).map(i => SERVICES[i]);
  }

  if (selectedServices.length === 0) {
    logger.warn('🚫 Nenhum serviço selecionado. Encerrando o setup.');
    process.exit(0);
  }

  // 6. Menu Interativo: Bancos de Dados
  const startDbAnswer = await question('\nDeseja subir os bancos de dados correspondentes aos serviços escolhidos? (s/N): ');
  
  if (startDbAnswer.trim().toLowerCase() === 's') {
    const composePath = path.join(DB_INFRA_DIR, 'docker-compose.yml');
    
    // Filtra apenas os serviços que possuem banco de dados (ignorando o api-gateway)
    const dbServices = selectedServices.filter(s => s.dbContainer);

    if (dbServices.length === 0) {
      logger.info('ℹ️ Os serviços selecionados não possuem banco de dados próprio.');
    } else {
      logger.info('\n📦 Subindo infraestrutura de dados...');
      
      for (const service of dbServices) {
        // O profile no docker-compose costuma ter o mesmo nome da propriedade "name" (ex: auth)
        const profile = service.name; 
        
        try {
          // Sobe o container via docker compose profile
          await exec('docker', ['compose', '-f', composePath, '--profile', profile, 'up', '-d']);
          // Aguarda o banco aceitar conexões antes de seguir
          await waitForDatabaseReady(profile, service.dbContainer);
        } catch (error) {
          logger.error(`❌ Falha ao inicializar o banco de dados do ${profile}: ${error.message}`);
          process.exit(1);
        }
      }
    }
  }

  logger.success('\n🎉 Setup Vivere finalizado com absoluto sucesso! O palco é todo seu.\n');
  rl.close();
}

main().catch(err => {
  logger.error(`\n❌ Erro crítico não tratado no setup: ${err.message}`);
  process.exit(1);
});