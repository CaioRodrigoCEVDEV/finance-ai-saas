# Deploy com Apache

Este documento descreve como configurar o Apache para servir o frontend e fazer proxy reverso para o backend.

## Pre-requisitos

- Apache instalado e rodando na VPS
- Modulos necessarios habilitados

```bash
sudo a2enmod proxy proxy_http rewrite headers ssl
sudo systemctl restart apache2
```

## Estrutura de diretorios

```
/var/www/finance-ai/frontend  → build do frontend (React)
/home/sites/finance-ai-saas   → repositorio do projeto
```

## VirtualHost — Frontend

Criar o arquivo `/etc/apache2/sites-available/finance-ai-app.conf`:

```apache
<VirtualHost *:80>
    ServerName app.financeai.orderup.com.br
    DocumentRoot /var/www/finance-ai/frontend

    <Directory /var/www/finance-ai/frontend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/finance-ai-app-error.log
    CustomLog ${APACHE_LOG_DIR}/finance-ai-app-access.log combined
</VirtualHost>
```

**Explicacao do Rewrite:**
- `^index\.html$ - [L]` — se a requisicao for exatamente `index.html`, serve o arquivo.
- `!-f` e `!-d` — se nao for arquivo nem diretorio existente.
- `RewriteRule . /index.html [L]` — redireciona tudo para `index.html` (fallback do React Router).

## VirtualHost — Backend

Criar o arquivo `/etc/apache2/sites-available/finance-ai-back.conf`:

```apache
<VirtualHost *:80>
    ServerName back.financeai.orderup.com.br

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3333/
    ProxyPassReverse / http://127.0.0.1:3333/

    ErrorLog ${APACHE_LOG_DIR}/finance-ai-back-error.log
    CustomLog ${APACHE_LOG_DIR}/finance-ai-back-access.log combined
</VirtualHost>
```

## Habilitar os sites

```bash
sudo a2ensite finance-ai-app.conf
sudo a2ensite finance-ai-back.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## SSL com Certbot

Apos confirmar que os sites estao funcionando em HTTP (porta 80):

```bash
sudo certbot --apache -d app.financeai.orderup.com.br -d back.financeai.orderup.com.br
```

O Certbot modifica automaticamente os VirtualHosts para incluir HTTPS (porta 443) e redirecionar HTTP → HTTPS.

## Testar

```bash
curl https://back.financeai.orderup.com.br/health
# Resposta esperada: {"status":"ok","app":"Finance AI API"}

curl https://app.financeai.orderup.com.br/
# Deve retornar o HTML do frontend
```

## Comandos uteis

```bash
# Verificar logs do Apache
sudo tail -f /var/log/apache2/finance-ai-app-error.log
sudo tail -f /var/log/apache2/finance-ai-app-access.log
sudo tail -f /var/log/apache2/finance-ai-back-error.log
sudo tail -f /var/log/apache2/finance-ai-back-access.log

# Recarregar configuracao
sudo systemctl reload apache2

# Reiniciar Apache
sudo systemctl restart apache2

# Verificar status
sudo systemctl status apache2
```

## Notas

- A porta `3333` do backend **nao** deve estar exposta publicamente. Apenas o proxy reverso do Apache deve acessa-la via `127.0.0.1`.
- O frontend e servido estaticamente pelo Apache. Nao ha processo Node.js rodando para o frontend.
- Cookies usam `sameSite: none` e `secure: true` em producao, o que exige HTTPS. Por isso o SSL e obrigatorio.
