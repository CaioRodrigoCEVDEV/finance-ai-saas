# Checklist de Producao

Use esta lista para validar cada etapa do deploy em producao.

## DNS

- [ ] `app.financeai.orderup.com.br` resolvendo para o IP da VPS
- [ ] `back.financeai.orderup.com.br` resolvendo para o IP da VPS

Testar:
```bash
dig +short app.financeai.orderup.com.br
dig +short back.financeai.orderup.com.br
```

## Banco de Dados

- [ ] PostgreSQL rodando e acessivel pela VPS
- [ ] `DATABASE_URL` configurada no `backend/.env`
- [ ] Migrations executadas (`npx prisma migrate deploy`)
- [ ] Seed executado (se desejar dados demo)

## Backend

- [ ] `backend/.env` configurado com valores reais de producao
- [ ] `JWT_SECRET` com chave forte (minimo 32 caracteres aleatorios)
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=https://app.financeai.orderup.com.br`
- [ ] `COOKIE_NAME=finance_ai_token`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] CORS configurado para usar `FRONTEND_URL` (ja feito no codigo)
- [ ] Cookies configurados com `secure: true` e `sameSite: none` (ja feito no codigo quando `NODE_ENV=production`)
- [ ] PM2 rodando (`pm2 status`)
- [ ] `pm2 save` executado
- [ ] `pm2 startup` configurado para reiniciar com o sistema
- [ ] Rota `/health` respondendo

Testar:
```bash
curl https://back.financeai.orderup.com.br/health
# Esperado: {"status":"ok","app":"Finance AI API"}
```

## Frontend

- [ ] `frontend/.env.production` configurado com `VITE_API_URL=https://back.financeai.orderup.com.br`
- [ ] Build executado: `cd frontend && npm install && npm run build`
- [ ] Build copiado para `/var/www/finance-ai/frontend`
- [ ] Permissoes corretas: `www-data:www-data`

## Apache

- [ ] Modulos habilitados: `proxy`, `proxy_http`, `rewrite`, `headers`, `ssl`
- [ ] VirtualHost de `app.financeai.orderup.com.br` configurado
- [ ] VirtualHost de `back.financeai.orderup.com.br` configurado
- [ ] React Router fallback funcionando (RewriteRule)
- [ ] Proxy reverso para `127.0.0.1:3333` configurado
- [ ] Apache recarregado sem erros (`sudo apache2ctl configtest`)

## SSL

- [ ] Certificado SSL instalado para ambos os dominios
- [ ] HTTPS funcionando em `app.financeai.orderup.com.br`
- [ ] HTTPS funcionando em `back.financeai.orderup.com.br`
- [ ] Renovacao automatica configurada (Certbot cria timer automaticamente)

Testar:
```bash
curl -I https://app.financeai.orderup.com.br
curl -I https://back.financeai.orderup.com.br
```

## Firewall

- [ ] Portas 80 e 443 liberadas publicamente
- [ ] Porta 3333 **bloqueada** publicamente (apenas localhost)
- [ ] Porta do PostgreSQL **bloqueada** publicamente
- [ ] Demais portas fechadas

Verificar com:
```bash
sudo ufw status
```

## Funcionalidades

- [ ] Login funcionando (`https://app.financeai.orderup.com.br/login`)
- [ ] Cookie `finance_ai_token` sendo enviado com `secure`, `httpOnly`, `sameSite=none`
- [ ] Dashboard carregando dados
- [ ] CRUD de contas, cartoes, categorias funcionando
- [ ] Transacoes, orcamentos, metas funcionando
- [ ] Importacao CSV/OFX funcionando
- [ ] Relatorios gerando
- [ ] Logout limpando cookie corretamente

## Backups

- [ ] Backup automatico do banco de dados configurado (cron + pg_dump)
- [ ] Script de backup testado

Exemplo de cron para backup diario:
```bash
# /etc/cron.d/finance-ai-backup
0 3 * * * postgres pg_dump -U USUARIO BANCO > /backups/finance-ai-$(date +\%Y\%m\%d).sql
```

## Seguranca

- [ ] Nenhum arquivo `.env` commitado no repositorio
- [ ] `DATABASE_URL` nao exposta em logs ou configs publicas
- [ ] `JWT_SECRET` nao exposto
- [ ] PostgreSQL nao acessivel publicamente
- [ ] Senhas fortes em uso
- [ ] HTTPS obrigatorio (redirecionamento HTTP → HTTPS ativo)
- [ ] Cookies de producao com `secure: true` e `sameSite: none`
- [ ] Helmet habilitado (ja configurado no codigo para producao)
