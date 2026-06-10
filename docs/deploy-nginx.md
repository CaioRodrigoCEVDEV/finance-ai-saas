# Deploy com Nginx (opcional)

Este documento descreve uma alternativa com Nginx no lugar do Apache.

## Pre-requisitos

- Nginx instalado e rodando na VPS

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

## Server Block — Frontend

Criar o arquivo `/etc/nginx/sites-available/finance-ai-app`:

```nginx
server {
    listen 80;
    server_name app.financeai.orderup.com.br;

    root /var/www/finance-ai/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    error_log /var/log/nginx/finance-ai-app-error.log;
    access_log /var/log/nginx/finance-ai-app-access.log;
}
```

## Server Block — Backend

Criar o arquivo `/etc/nginx/sites-available/finance-ai-back`:

```nginx
server {
    listen 80;
    server_name back.financeai.orderup.com.br;

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    error_log /var/log/nginx/finance-ai-back-error.log;
    access_log /var/log/nginx/finance-ai-back-access.log;
}
```

## Habilitar os sites

```bash
sudo ln -s /etc/nginx/sites-available/finance-ai-app /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/finance-ai-back /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL com Certbot

```bash
sudo certbot --nginx -d app.financeai.orderup.com.br -d back.financeai.orderup.com.br
```

## Comandos uteis

```bash
sudo nginx -t                          # Testar configuracao
sudo systemctl reload nginx            # Recarregar
sudo systemctl restart nginx           # Reiniciar
sudo systemctl status nginx            # Status
sudo tail -f /var/log/nginx/finance-ai-app-error.log
sudo tail -f /var/log/nginx/finance-ai-back-error.log
```

## Notas

- Esta configuracao e opcional. O padrao do projeto e Apache.
- A porta `3333` do backend **nao** deve estar exposta publicamente.
- Cookies usam `sameSite: none` e `secure: true` em producao — HTTPS obrigatorio.
