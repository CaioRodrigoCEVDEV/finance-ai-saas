# AGENTS.md — Orientações para Assistentes de IA

Este documento padroniza como IAs devem trabalhar no projeto **Finance AI SaaS**.

---

## 1. Início de Tarefa

- Leia este arquivo (AGENTS.md) primeiro.
- Leia os documentos de documentação relevantes para a tarefa (ver seção 3).
- Identifique os arquivos que precisam ser alterados com `glob` e `grep` — nunca leia o projeto inteiro.
- Se houver dúvida sobre o contexto, pergunte ao usuário antes de agir.

---

## 2. Quando Usar Graphify

Use `/graphify` quando precisar:
- Entender relações entre arquivos, módulos ou fluxos de dados.
- Navegar por dependências entre frontend e backend.
- Explorar arquitetura de forma não-linear.

Graphify está disponível via skill `graphify`. Invoque antes de investigar
profundamente o código quando a tarefa envolver múltiplos módulos ou camadas.

---

## 3. Documentação de Referência

Consulte estes arquivos antes de alterar qualquer código:

| Arquivo | Conteúdo | Quando consultar |
|---|---|---|
| `ARCHITECTURE.md` | Stack, estrutura do monorepo, fluxos principais | Toda tarefa |
| `DESIGN.md` | Design system, tokens, temas claro/escuro | Alterações no frontend |
| `PROJECT_RULES.md` | Regras obrigatórias (UUID, soft delete, Decimal, Zod, etc.) | Toda alteração de código |
| `FINANCE_RULES.md` | Regras financeiras sensíveis (saldo, fatura, limite) | Alterações no domínio financeiro |

Leia apenas as seções relevantes — não o documento inteiro.

---

## 4. Não Ler o Projeto Inteiro Sem Necessidade

- Use `grep` e `glob` para localizar arquivos específicos.
- Leia apenas os arquivos que precisam ser entendidos ou alterados.
- Evite escanear diretórios inteiros (ex.: `node_modules/`, `dist/`, `.git/`).
- Se a tarefa exigir visão ampla, prefira Graphify.

---

## 5. Alterações Pequenas e Seguras

- Prefira `edit` (substituição exata) em vez de reescrever arquivos inteiros.
- Uma alteração por vez: edite, verifique, depois passe para a próxima.
- Nunca altere mais de 3 arquivos sem validação intermediária.
- Ao editar JS/TS, preserve a estrutura de imports e a formatação existente.
- Nunca adicione comentários a menos que o código existente já os use.

---

## 6. Sem Commit Automático

- **Nunca** execute `git add`, `git commit`, `git push` ou `gh pr` sem autorização explícita do usuário.
- Após alterações, apenas informe o que foi feito — não versionamento.

---

## 7. Regras Sensíveis — Explique Antes de Alterar

Antes de alterar qualquer regra em `FINANCE_RULES.md` ou `PROJECT_RULES.md`,
ou qualquer código que implemente essas regras:

1. Explique a alteração proposta e seu impacto.
2. Aguarde confirmação do usuário.
3. Só então implemente.

---

## 8. Padrão de Resposta Final

Após cada tarefa, responda neste formato:

```
## Resumo
- O que foi feito (1-3 linhas)
- Arquivos alterados (lista)
```

Não adicione explicações extensas, agradecimentos ou observações não solicitadas.

---

## 9. Checklist Antes de Finalizar

- [ ] As alterações seguem `PROJECT_RULES.md` e `FINANCE_RULES.md`?
- [ ] Não há `console.log`, `debugger` ou comentários de desenvolvimento?
- [ ] IDs únicos UUID, soft delete com `deleted_at`, `Decimal(18,2)` para dinheiro?
- [ ] Português (pt-BR) em strings de interface e mensagens de erro?
- [ ] A formatação do código segue o estilo existente?

Apenas marque como concluído — não execute ferramentas externas de lint/test
a menos que instruído pelo usuário.
