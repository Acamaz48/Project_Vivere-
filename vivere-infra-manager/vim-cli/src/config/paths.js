// vim-cli/src/config/paths.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sobe 3 níveis a partir deste arquivo (src -> vim-cli -> raiz)
export const ROOT_DIR = path.resolve(__dirname, '../../../'); 

// Caminhos base
export const DB_DIR = path.join(ROOT_DIR, 'docker-postgresql-v16');
export const MONOREPO_DIR = path.join(ROOT_DIR, 'workspace-monorepo-vim');
export const LOGS_DIR = path.join(ROOT_DIR, 'logs');

// Mapeamento inteligente dos microserviços (para facilitar as opções dos menus)
export const SERVICES = [
  { name: 'auth', folder: 'auth-service', hasDb: true },
  { name: 'identity', folder: 'identity-service', hasDb: true },
  { name: 'warehouse', folder: 'warehouse-service', hasDb: true },
  { name: 'service-order', folder: 'service-order-service', hasDb: true },
  { name: 'logistics', folder: 'logistics-service', hasDb: true },
  { name: 'api-gateway', folder: 'api-gateway', hasDb: false }
];