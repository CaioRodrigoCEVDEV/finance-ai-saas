# Finance AI SaaS

SaaS multi-tenant de finanças pessoais, com dashboard, contas, cartões, categorias, transações, orçamentos, metas, importação de extratos, regras de categorização e relatórios.

## Links de produção

| Serviço | URL |
|----------|-----|
| Frontend | [https://app.financeai.orderup.com.br](https://app.financeai.orderup.com.br) |
| Backend/API | [https://back.financeai.orderup.com.br](https://back.financeai.orderup.com.br) |

## Stack

### Backend
- Node.js
- Express
- Prisma ORM
- Zod (validação)
- JWT (jsonwebtoken)
- bcryptjs
- Multer + Sharp (upload e redimensionamento de avatar)
- csv-parse (importação de extratos)
- Helmet, CORS, Compression, Morgan, cookie-parser, express-rate-limit

### Frontend
- React 18
- Vite
- React Router DOM v6
- Axios
- Tailwind CSS
- Lucide React (ícones)
- react-easy-crop (recorte de avatar)
- vite-plugin-pwa (PWA)

### Banco de dados
- PostgreSQL
- Prisma ORM com migrations

### Infraestrutura / Deploy
- Apache (frontend + proxy reverso)
- PM2 (gerenciamento de processos do backend)
- Certbot (SSL/TLS)
- GitHub Actions (CI/CD)
- Ubuntu (VPS)

## Funcionalidades implementadas

- **Autenticação**: login, logout, sessão via cookie httpOnly com JWT, endpoint `/auth/me`
- **Multi-tenant**: isolamento completo por `tenant_id`, RBAC com papéis OWNER, ADMIN, MEMBER, READONLY
- **Admin SaaS**: área `/admin` separada do app principal, protegida por `SUPER_ADMIN`, com dashboard global, gestão de workspaces, usuários, limites de planos, feedbacks e auditoria
- **Dashboard**: visão consolidada com saldo, receitas, despesas, economia, alertas, top despesas, status de orçamentos, progresso de metas, fluxo mensal, distribuição por categoria e transações recentes
- **Contas**: CRUD de contas bancárias, carteiras e investimentos com saldo e soft delete
- **Cartões de crédito**: CRUD com limite, dia de fechamento, dia de vencimento, conta vinculada e valor da fatura atual
- **Categorias**: CRUD com categorias globais padrão e personalizadas por tenant, hierarquia pai/filho
- **Transações**: CRUD com filtros avançados, paginação, resumo mensal, múltiplos tipos (receita, despesa, transferência, investimento), status, método de pagamento, origem e soft delete
- **Orçamentos**: CRUD mensal por categoria, com cálculo automático de valor usado, percentual, status (seguro/alerta/excedido)
- **Metas**: CRUD com progresso automático, data limite, contribuição mensal sugerida, conclusão automática e ajuste manual de progresso
- **Importação CSV/OFX**: upload com preview, edição inline, matching automático por regras de categorização + heurísticas como fallback, detecção de duplicatas
- **Regras de categorização**: CRUD de regras automáticas por descrição (contains, starts_with, ends_with, equals, regex), testador individual e aplicação em lote sobre transações existentes
- **Relatórios**: resumo financeiro, por categoria, por conta, por cartão de crédito, evolução mensal, top despesas e exportação CSV
- **Faturas de cartão**: listagem, fatura atual, sumário, geração, recálculo, pagamento e cancelamento de pagamento
- **Recorrências**: CRUD de transações recorrentes com frequência configurável, status e geração manual de transação
- **Calendário financeiro**: visualização mensal de transações
- **Notificações**: listagem, contagem de não lidas, marcar como lida individual ou em lote, exclusão e geração de alertas financeiros (orçamento, metas, limite de cartão)
- **Perfil**: visualização e edição de perfil, alteração de senha, upload e remoção de avatar com redimensionamento via Sharp
- **Configurações do tenant**: moeda, tema, formato de data, preferências de notificação e conta padrão
- **Convites/Indicações**: CRUD de links de convite com rastreamento de cliques e cadastros
- **Tema claro/escuro**: alternância entre claro, escuro e sistema (preferência do SO), com toggle no layout
- **PWA**: Progressive Web App com ícones, página offline, botão de instalação e caching
- **Rate limiting**: limite de 10 req/min para rotas de autenticação e 200 req/min para API geral (por tenant+usuário)
- **Auditoria**: registro automático de ações no banco (`audit_logs`)
- **Segurança**: Helmet com CSP em produção, CORS restrito, cookies httpOnly/secure/sameSite, compressão, PostgreSQL acessível apenas localmente

## Estrutura de pastas

```
finance-ai-saas/
├── .github/workflows/          # CI/CD (GitHub Actions)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo de dados
│   │   ├── seed.js             # Seed de dados demo
│   │   └── migrations/         # Migrations do Prisma
│   ├── scripts/
│   │   └── create-user.js      # Script de criação de usuário via terminal
│   ├── src/
│   │   ├── app.js              # Configuração do Express
│   │   ├── server.js           # Entry point
│   │   ├── config/             # env, cors, prisma client
│   │   ├── routes/             # Agregador de rotas
│   │   ├── middlewares/        # rate-limiter, error-handler, authorize, audit-log
│   │   ├── services/           # token-service
│   │   ├── utils/              # app-error, cookie-options, validate-request
│   │   ├── validators/         # common.schema
│   │   └── modules/            # módulos de domínio (inclui admin e feedbacks)
│   ├── uploads/avatars/        # Avatares enviados
│   ├── .env.example
│   ├── .env.production.example
│   └── package.json
├── frontend/
│   ├── public/                 # favicon, ícones PWA, offline.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── contexts/           # AuthContext, ThemeContext, ToastContext
│   │   ├── routes/             # Definição de rotas com proteção
│   │   ├── layouts/            # MainLayout, AppLayout, admin/AdminLayout
│   │   ├── pages/              # páginas do app e do admin
│   │   ├── components/         # ~55 componentes (ui, layout, domain)
│   │   ├── services/           # 20 serviços de API
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/              # cn, formatters, greeting
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── deploy-apache.md        # Configuração do Apache
│   ├── deploy-nginx.md         # Alternativa Nginx
│   ├── deploy-ci-cd.md         # Guia de CI/CD com GitHub Actions
│   └── production-checklist.md # Checklist de produção
├── scripts/
│   ├── deploy-all.sh           # Deploy completo (backend + frontend)
│   ├── deploy-backend.sh       # Deploy do backend
│   ├── deploy-frontend.sh      # Deploy do frontend
│   └── deploy-production.sh    # Script único usado pelo CI/CD
├── ecosystem.config.js         # Configuração do PM2
├── docker-compose.local.example.yml  # PostgreSQL local de desenvolvimento
└── README.md
```

### Módulos do backend (`backend/src/modules/`)

| Módulo | Prefixo |
|--------|---------|
| auth | `/auth` |
| accounts | `/accounts` |
| categories | `/categories` |
| credit-cards | `/credit-cards` |
| dashboard | `/dashboard` |
| transactions | `/transactions` |
| budgets | `/budgets` |
| goals | `/goals` |
| imports | `/imports` |
| categorization-rules | `/categorization-rules` |
| reports | `/reports` |
| notifications | `/notifications` |
| profile | `/profile` |
| settings | `/settings` |
| recurrences | `/recurrences` |
| financial-calendar | `/financial-calendar` |
| invites | `/invites` |
| invoices | `/invoices` |
| tenants | `/tenants` |
| feedbacks | `/feedbacks` |
| admin | `/admin` |

## Variáveis de ambiente

### Backend (`backend/.env`)

```env
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO?schema=public"
JWT_SECRET=change-me-please-use-at-least-32-chars
JWT_EXPIRES_IN=7d
COOKIE_NAME=finance_ai_token
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_API_MAX=200
```

Em produção, use `backend/.env.production.example` como referência. Os principais ajustes são:

- `NODE_ENV=production`
- `FRONTEND_URL=https://app.financeai.orderup.com.br`
- `JWT_SECRET` com chave forte
- Cookies passam a usar `secure: true` e `sameSite: 'none'`

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3333
```

Em produção, aponte para a URL real da API (`https://back.financeai.orderup.com.br`).

## Como rodar localmente

### Banco de dados

O projeto depende de PostgreSQL. Você pode usar o Docker Compose de exemplo:

```bash
docker compose -f docker-compose.local.example.yml up -d
```

### Backend

```bash
cd backend
cp .env.example .env         # Edite o .env com suas credenciais
npm install
npx prisma generate
npx prisma migrate dev
npm run dev                   # Porta 3333 (nodemon)
```

### Frontend

```bash
cd frontend
cp .env.example .env         # Edite o .env se necessário
npm install
npm run dev                   # Porta 5173 (Vite)
```

### Seed de dados demo

```bash
cd backend
npx prisma db seed
```

## Banco de dados e Prisma

O Prisma gerencia o schema, migrations e seed do projeto.

| Comando | Descrição |
|---------|-----------|
| `npx prisma generate` | Gera o Prisma Client após mudanças no schema |
| `npx prisma migrate dev` | Cria e aplica migrations em desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrations pendentes em produção (sem criar novas) |
| `npx prisma db seed` | Popula o banco com dados demo |
| `npx prisma studio` | Abre o Prisma Studio (interface visual para o banco) |

O schema está em `backend/prisma/schema.prisma` e contém os modelos centrais do SaaS com suporte a multi-tenant, soft delete, hierarquia de categorias, auditoria e administração global.

Com o painel administrativo, o schema também inclui:

- `User.global_role` com valores `USER` e `SUPER_ADMIN`
- `PlanLimit` para limites e features por plano

## Usuário demo e admin

O seed cria dois usuários vinculados ao tenant **Finance AI Demo**:

| Email | Senha | Papel |
|-------|-------|-------|
| `demo@financeai.com` | `123456` | OWNER de tenant, usuário comum |
| `admin@financeai.com` | `123456` | OWNER de tenant + `SUPER_ADMIN` |

### Acesso ao painel admin

- URL: `http://localhost:5173/admin`
- Requisito: usuário autenticado com `globalRole === SUPER_ADMIN`
- Usuários OWNER/ADMIN/MEMBER/READONLY de tenant não acessam `/admin` por padrão

O frontend redireciona usuários sem permissão para `/dashboard` e o backend protege todas as rotas `/admin/*` com `requireAuth` + `requireSuperAdmin`.

O seed também cria:

- 4 contas, 3 cartões de crédito, 22 categorias globais
- ~90 transações distribuídas em 6 meses
- 7 orçamentos com diferentes status
- 5 metas financeiras
- 10 regras de categorização
- Configurações padrão do tenant
- Limites padrão para os planos `FREE`, `PRO`, `PREMIUM` e `FAMILY`

## Planos e limites

Os limites editáveis do SaaS ficam na tabela `PlanLimit` e são gerenciados em `/admin/plans`.

Campos suportados:

- `maxAccounts`
- `maxCreditCards`
- `maxUsers`
- `maxTransactionsPerMonth`
- `canImport`
- `canExportReports`
- `canUseAi`
- `canUseOpenFinance`

## Rotas administrativas

Todas as rotas abaixo exigem autenticação e permissão global `SUPER_ADMIN`.

### Dashboard

- `GET /admin/dashboard`

### Workspaces

- `GET /admin/tenants`
- `GET /admin/tenants/:id`
- `PATCH /admin/tenants/:id`
- `POST /admin/tenants/:id/suspend`
- `POST /admin/tenants/:id/reactivate`

### Usuários

- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id`
- `POST /admin/users/:id/block`
- `POST /admin/users/:id/unblock`
- `POST /admin/users/:id/reset-password`

### Planos

- `GET /admin/plans`
- `GET /admin/plans/:plan`
- `PATCH /admin/plans/:plan`

### Feedbacks

- `POST /feedbacks` (usuário autenticado)
- `GET /admin/feedbacks`
- `GET /admin/feedbacks/:id`
- `PATCH /admin/feedbacks/:id`

### Auditoria

- `GET /admin/audit-logs`

## Scripts úteis

```bash
# Criar usuário e tenant via terminal
cd backend && npm run create:user -- \
  --name "Seu Nome" \
  --email "seu@email.com" \
  --password "sua-senha" \
  --tenant "Seu Tenant" \
  --role OWNER \
  --plan PREMIUM
```

## Endpoints principais

### Auth
| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | `/auth/login` | Pública (rate limit 10/min) | Login |
| POST | `/auth/logout` | Pública | Logout |
| GET | `/auth/me` | Autenticado | Dados do usuário logado + tenant ativo |

### Dashboard
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dashboard/overview` | Resumo geral (saldo, receitas, despesas, economia) |
| GET | `/dashboard/summary` | Sumário do mês atual |
| GET | `/dashboard/expenses-by-category` | Distribuição de despesas por categoria |
| GET | `/dashboard/recent-transactions` | Transações recentes |
| GET | `/dashboard/monthly-flow` | Fluxo mensal (6 meses) |
| GET | `/dashboard/alerts` | Alertas financeiros |
| GET | `/dashboard/top-expenses` | Top despesas do mês |
| GET | `/dashboard/budget-status` | Status dos orçamentos |
| GET | `/dashboard/goals-progress` | Progresso das metas |

### Accounts, Categories, Transactions, Credit Cards, Budgets, Goals
Cada módulo oferece endpoints RESTful:
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/<resource>` | Listagem com filtros e paginação |
| GET | `/<resource>/:id` | Detalhe por ID |
| POST | `/<resource>` | Criação |
| PUT | `/<resource>/:id` | Atualização |
| DELETE | `/<resource>/:id` | Soft delete |

Rotas de escrita exigem `requireWrite` (OWNER, ADMIN ou MEMBER).

### Imports
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/imports/preview` | Upload e preview de CSV/OFX (máx. 5 MB) |
| POST | `/imports/confirm` | Confirmação da importação |

### Categorization Rules
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/categorization-rules` | Listagem |
| GET | `/categorization-rules/:id` | Detalhe |
| POST | `/categorization-rules` | Criação |
| PUT | `/categorization-rules/:id` | Atualização |
| DELETE | `/categorization-rules/:id` | Exclusão |
| POST | `/categorization-rules/test` | Testar regra em uma descrição |
| POST | `/categorization-rules/apply` | Aplicar regras em lote |

### Reports
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/reports/financial-summary` | Resumo financeiro |
| GET | `/reports/by-category` | Por categoria |
| GET | `/reports/by-account` | Por conta |
| GET | `/reports/by-credit-card` | Por cartão |
| GET | `/reports/monthly-evolution` | Evolução mensal |
| GET | `/reports/top-expenses` | Top despesas |
| GET | `/reports/export.csv` | Exportação CSV |

### Notifications
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/notifications` | Listagem |
| GET | `/notifications/unread-count` | Contagem de não lidas |
| PUT | `/notifications/:id/read` | Marcar como lida |
| PUT | `/notifications/read-all` | Marcar todas como lidas |
| DELETE | `/notifications/:id` | Exclusão |
| POST | `/notifications/generate-alerts` | Gerar alertas financeiros |

### Profile
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/profile` | Dados do perfil |
| PUT | `/profile` | Atualizar nome/email |
| PUT | `/profile/password` | Alterar senha |
| PUT | `/profile/avatar` | Upload de avatar (multipart) |
| DELETE | `/profile/avatar` | Remover avatar |

### Settings, Recurrences, Invites, Invoices, Tenants, Financial Calendar
Cada módulo oferece endpoints RESTful com validação Zod. Consulte os READMEs individuais em `backend/src/modules/<modulo>/README.md` para detalhes completos.

### Health
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check público |

## Deploy

### Estrutura na VPS

```
/home/sites/finance-ai-saas/    → repositório do projeto
/var/www/finance-ai/frontend/   → build do frontend (servido pelo Apache)
```

### Scripts de deploy

```bash
chmod +x scripts/*.sh

# Deploy completo (backend + frontend)
./scripts/deploy-all.sh

# Apenas backend (git pull → npm install → prisma → pm2 restart)
./scripts/deploy-backend.sh

# Apenas frontend (git pull → npm install → build → copia para /var/www)
./scripts/deploy-frontend.sh
```

### CI/CD

Um workflow do GitHub Actions (`deploy-production.yml`) executa `scripts/deploy-production.sh` na VPS automaticamente a cada push na branch `main`.

Configuração detalhada em `docs/deploy-ci-cd.md`.

## Apache e PM2

### Apache

O frontend é servido como build estático pelo Apache. Um proxy reverso encaminha as chamadas à API para o backend.

Certbot é utilizado para SSL/TLS (HTTPS).

Configuração detalhada: `docs/deploy-apache.md`.

### PM2

O backend roda como processo gerenciado pelo PM2:

```bash
pm2 start ecosystem.config.js --env production   # Iniciar
pm2 restart finance-ai-backend                    # Reiniciar
pm2 stop finance-ai-backend                       # Parar
pm2 status                                        # Ver status
pm2 logs finance-ai-backend                       # Ver logs
pm2 save                                          # Salvar processos ativos
pm2 startup                                       # Auto-start com o sistema
```

## Cuidados importantes

- **Nunca commitar `.env`** — o arquivo já está no `.gitignore`
- **Use os `.env.example` como referência** — `backend/.env.example` e `frontend/.env.example`
- **`FRONTEND_URL` em produção** deve apontar para o domínio real do frontend (ex: `https://app.financeai.orderup.com.br`)
- **`VITE_API_URL` em produção** deve apontar para o domínio real da API (ex: `https://back.financeai.orderup.com.br`)
- **Cookies em produção** usam `secure: true` e `sameSite: 'none'` porque frontend e backend estão em subdomínios diferentes
- **PostgreSQL não deve ficar exposto publicamente** — mantenha bind apenas em localhost
- **Firewall**: apenas portas 80 e 443 devem estar abertas publicamente
- **Rate limiting**: 10 req/min em `/auth/login`, 200 req/min nas demais rotas autenticadas

## Roadmap

Funcionalidades planejadas ou em evolução:

- **Open Finance**: integração com instituições financeiras (modelo `OpenFinanceConnection` já existe no schema, mas sem endpoints implementados)
- **IA para categorização automática**: sugestão inteligente de categorias usando machine learning
- **Assistente financeiro**: chat ou interface de consulta sobre finanças
- **Assinaturas / Stripe**: planos pagos com checkout e gerenciamento
- **Convite de membros ao workspace**: permitir que usuários convidem outros para o mesmo tenant
- **Recuperação de senha**: fluxo de esqueci minha senha com envio de email
- **Exportação PDF**: relatórios em PDF além do CSV atual
- **Notificações por email**: alertas e resumos enviados por email
- **Backup automático**: rotina de backup do banco de dados
- **Auditoria visual**: interface para visualizar logs de auditoria
- **Melhorias de PWA**: cache offline avançado, sincronização background
- **Melhorias de perfil/workspace**: multi-tenant com troca entre tenants no frontend

## Licença

MIT
