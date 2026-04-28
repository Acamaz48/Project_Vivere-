// scripts/common/config.js
/**
 * Configurações centralizadas para os scripts do Monorepo.
 * Evita caminhos hardcoded espalhados por clean.js, setup.js, etc.
 */
const path = require('path');

// Caminhos base
const ROOT_DIR = path.resolve(__dirname, '../..');
const DB_INFRA_DIR = path.resolve(ROOT_DIR, '..', 'docker-postgresql-v16');

// Definição centralizada dos microserviços e seus respectivos bancos
const SERVICES = [
  { name: 'auth', folder: 'auth-service', dbContainer: 'auth-db' },
  { name: 'identity', folder: 'identity-service', dbContainer: 'identity-db' },
  { name: 'warehouse', folder: 'warehouse-service', dbContainer: 'warehouse-db' },
  { name: 'service-order', folder: 'service-order-service', dbContainer: 'service-order-db' },
  { name: 'logistics', folder: 'logistics-service', dbContainer: 'logistics-db' },
  { name: 'gateway', folder: 'api-gateway', dbContainer: null } // Gateway não tem banco próprio
];

// Alvos padrão para limpeza (usado pelo clean.js e reset.js)
const CLEAN_TARGETS = {
  nx: path.join(ROOT_DIR, '.nx', 'cache'),
  dist: path.join(ROOT_DIR, 'dist'),
  prisma: path.join(ROOT_DIR, 'apps', 'backend', '*', 'src', 'prisma', 'generated'),
  migrations: path.join(ROOT_DIR, 'apps', 'backend', '*', 'prisma', 'migrations'),
  modules: path.join(ROOT_DIR, 'node_modules'),
  lock: path.join(ROOT_DIR, 'package-lock.json'),
};

module.exports = {
  ROOT_DIR,
  DB_INFRA_DIR,
  SERVICES,
  CLEAN_TARGETS
};