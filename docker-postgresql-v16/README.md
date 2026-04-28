docker-postgresql-v16/
├── .env                           # Variáveis comuns (opcional)
├── docker-compose.yml
├── identity/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── init/
│   │   ├── 01-extensions.sql      # Extensões como pgcrypto, uuid-ossp
│   │   └── 02-config.sql           # Configurações adicionais (ex.: timezone)
│   ├── seeds/
│   │   ├── development.sql
│   │   └── staging.sql
│   └── data/                       # (não versionado) – persistência
│       ├── development/
│       ├── staging/
│       └── production/
├── auth/                           # mesma estrutura
├── warehouse/
├── service-order/
└── logistics/


Explicação dos arquivos
.env: Armazena variáveis de ambiente comuns, como POSTGRES_USER=postgres, POSTGRES_PASSWORD (sensível, não versionado). Pode ser ignorado no git.

docker-compose.yml: Orquestra todos os serviços, com perfis e volumes dinâmicos.

Dockerfile: Constrói a imagem com scripts de inicialização e seeds.

.dockerignore: Evita copiar data/ e outros arquivos locais.

init/: Scripts executados na primeira inicialização (apenas uma vez). O 01-extensions.sql pode conter CREATE EXTENSION IF NOT EXISTS "pgcrypto", etc.

seeds/: Scripts de carga de dados, executados condicionalmente via variável SEED_ENV.

data/: Pastas montadas como volumes, separadas por ambiente. Não devem ser versionadas.


