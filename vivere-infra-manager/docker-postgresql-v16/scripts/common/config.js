// scripts/common/config.js
/**
 * Configurações centralizadas para os scripts de gerenciamento do Docker.
 * Isso evita repetição de código (DRY) e facilita a adição de novos microserviços.
 */
const path = require('path');

// Lista oficial de todos os microserviços que possuem banco de dados
const PROFILES = ['auth', 'identity', 'logistics', 'service-order', 'warehouse'];

// Mapeamento exato dos nomes dos bancos de dados (cuidado com hífens vs underlines)
const DB_NAMES = {
  auth: 'auth_db',
  identity: 'identity_db',
  logistics: 'logistics_db',
  'service-order': 'service_order_db',
  warehouse: 'warehouse_db',
};

// Caminhos base do projeto
const COMPOSE_DIR = path.resolve(__dirname, '../..');
const BACKUP_DIR = path.join(COMPOSE_DIR, 'backups');

/**
 * Retorna o nome padrão do container no Docker Compose
 * @param {string} profile - Nome do microserviço
 * @returns {string} Nome do container
 */
function getContainerName(profile) {
  return `${profile}-db`;
}

/**
 * Retorna o nome correto do banco de dados interno do PostgreSQL
 * @param {string} profile - Nome do microserviço
 * @returns {string} Nome do banco de dados
 */
function getDbName(profile) {
  return DB_NAMES[profile] || `${profile}_db`;
}

/**
 * Retorna o usuário padrão do banco (usa env var se disponível)
 * @returns {string}
 */
function getDbUser() {
  return process.env.POSTGRES_USER || 'postgres';
}

module.exports = {
  PROFILES,
  COMPOSE_DIR,
  BACKUP_DIR,
  getContainerName,
  getDbName,
  getDbUser,
};