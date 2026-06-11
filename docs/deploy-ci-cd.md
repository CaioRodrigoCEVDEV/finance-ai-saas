# CI/CD — Deploy Automático com GitHub Actions

Este documento explica como configurar o deploy automático via GitHub Actions. Ao fazer push na branch `main`, o workflow conecta na VPS via SSH e executa o script `scripts/deploy-production.sh`.

## Arquitetura

```
git push (main) → GitHub Actions → SSH na VPS → scripts/deploy-production.sh
                                                      ├── git pull
                                                      ├── backend (install, prisma, migrate, pm2 restart)
                                                      ├── frontend (install, build, copiar para Apache)
                                                      └── apache reload
```

## 1. Criar chave SSH para deploy

Na sua máquina local ou na VPS:

```bash
ssh-keygen -t ed25519 -C "github-actions-financeai" -f ~/.ssh/financeai_github_actions
```

Adicionar a chave pública no servidor:

```bash
cat ~/.ssh/financeai_github_actions.pub >> ~/.ssh/authorized_keys
```

Ler a chave privada para copiar no GitHub Secrets:

```bash
cat ~/.ssh/financeai_github_actions
```

## 2. Configurar Secrets no GitHub

Acesse o repositório no GitHub:
**Repository → Settings → Secrets and variables → Actions → New repository secret**

Crie os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou hostname da VPS | `123.45.67.89` |
| `VPS_USER` | Usuário SSH com permissão de deploy | `root` ou `deploy` |
| `VPS_PORT` | Porta SSH | `22` |
| `VPS_SSH_KEY` | Conteúdo da chave privada SSH | (saída do `cat ~/.ssh/financeai_github_actions`) |

## 3. Permissões necessárias na VPS

O usuário SSH usado no deploy precisa ter permissão para:

- Acessar `/home/sites/finance-ai-saas` (leitura e escrita)
- Executar `git fetch` e `git reset`
- Rodar `npm install`
- Rodar `npx prisma generate` e `npx prisma migrate deploy`
- Rodar `pm2 restart`
- Copiar arquivos para `/var/www/finance-ai/frontend`
- Executar `sudo systemctl reload apache2` (se usuário deploy, configurar sudo sem senha)
- Executar `sudo apache2ctl configtest`

### Se usar usuário `deploy` (não-root)

Adicionar no `/etc/sudoers.d/deploy`:

```
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload apache2
deploy ALL=(ALL) NOPASSWD: /usr/sbin/apache2ctl configtest
deploy ALL=(ALL) NOPASSWD: /usr/bin/rm -rf /var/www/finance-ai/frontend/*
deploy ALL=(ALL) NOPASSWD: /usr/bin/cp -r * /var/www/finance-ai/frontend/
deploy ALL=(ALL) NOPASSWD: /usr/bin/chown -R www-data:www-data /var/www/finance-ai/frontend
```

## 4. Dar permissão ao script de deploy

```bash
chmod +x scripts/deploy-production.sh
git add scripts/deploy-production.sh
git commit -m "Adiciona script de deploy para CI/CD"
git push origin main
```

## 5. Testar o deploy

Faça um push para a branch `main`:

```bash
git push origin main
```

Acompanhe o workflow em:
**GitHub → Actions → Deploy Production**

## Observações

- O deploy **não** executa seed automático em produção.
- O deploy **não** sobrescreve arquivos `.env` na VPS (estão no `.gitignore`).
- O script usa `set -e` — qualquer erro interrompe o deploy.
- O script **não** imprime variáveis sensíveis como `JWT_SECRET` ou `DATABASE_URL`.
- O Apache é recarregado com `reload` (graceful, sem downtime).
- O PM2 é reiniciado com `--update-env` para garantir que variáveis de ambiente sejam recarregadas.

## Troubleshooting

### Erro: Permission denied (publickey)
- Verifique se a chave pública foi adicionada ao `~/.ssh/authorized_keys` no servidor.
- Verifique se a chave privada foi copiada corretamente no secret `VPS_SSH_KEY`.
- Verifique permissões: `chmod 600 ~/.ssh/authorized_keys` e `chmod 700 ~/.ssh`.

### Erro: sudo: a password is required
- Configure o sudo sem senha para os comandos necessários (veja seção 3).
- Ou use o usuário `root` como `VPS_USER`.

### Erro: npm: command not found
- Certifique-se de que o Node.js está instalado e disponível no PATH do usuário SSH.
- Se usar nvm, adicione `source ~/.nvm/nvm.sh` no início do script `deploy-production.sh`.

### Erro: pm2: command not found
- Instale o PM2 globalmente: `npm install -g pm2`.
- Se usar nvm ou path personalizado, ajuste o PATH conforme necessário.
