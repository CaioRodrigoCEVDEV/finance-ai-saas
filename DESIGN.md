# Finance AI SaaS — Guia de Design Visual

## 1. Visão Geral do Design System

### Identidade Visual

Finance AI SaaS é um aplicativo de gestão financeira pessoal/empresarial com identidade moderna, premium e confiável. O design transmite segurança e sofisticação através de cantos arredondados generosos (`rounded-2xl` e `rounded-[28px]`), sombras suaves (`shadow-soft`, `shadow-glow`), espaçamento generoso e uma paleta de cores frias com acento verde/emerald.

### Sensação Desejada
- **Moderno**: cantos arredondados, backdrop-blur, transições suaves
- **Premium**: sombras suaves, border-radius consistentes, tipografia limpa
- **Financeiro**: acentos verdes (crescimento), números em destaque
- **Limpo**: espaçamento amplo, grids organizados, scrollbar oculta
- **Confiável**: cores consistentes, feedback visual claro, sem ruído

### Diferença Tema Claro vs Escuro

| Propriedade | Claro | Escuro |
|---|---|---|
| Fundo da página | `bg-slate-50 (#f8fafc)` | `bg-slate-950 (#0f172a)` |
| Fundo de cards | `bg-white` | `dark:bg-slate-800` |
| Borda de cards | `border-slate-200` | `dark:border-slate-700` |
| Sombra | `shadow-soft` / `shadow-glow` | Nenhuma (removida no dark) |
| Texto primário | `text-slate-900` | `dark:text-slate-100` |
| Texto secundário | `text-slate-500` | `dark:text-slate-400` |
| Input bg | `bg-white` | `dark:bg-slate-700/40` |
| Overlay modal | `bg-slate-950/40` | (mesmo, adaptável) |
| Backdrop | `backdrop-blur-sm` | (mesmo) |

---

## 2. Cores

### Cores Principais (Brand)

Paleta definida em `tailwind.config.js`:

```js
brand: {
  50:  '#ecfdf5',   // hover/active bg claro
  100: '#d1fae5',   // ring sutil
  400: '#34d399',   // ícones/acento (escuro)
  500: '#10b981',   // primary default
  600: '#059669',   // primary hover, texto acento
  700: '#047857',   // primary active
  900: '#064e3b',   // hover dark
}
```

### Fundo

| Uso | Claro | Escuro |
|---|---|---|
| Página | `bg-slate-50 (#f8fafc)` | `bg-slate-950 (#0f172a)` |
| Card/componente | `bg-white` | `dark:bg-slate-800 (#1e293b)` |
| Input | `bg-white` | `dark:bg-slate-700/40` |
| Topbar | `bg-white/85` + backdrop | `dark:bg-slate-800/80` + backdrop |
| Dropdown | `bg-white` | `dark:bg-slate-800` (Select: `dark:bg-slate-900`) |
| Active/selected | `bg-emerald-50` | `dark:bg-emerald-900/20` ou `/30` |

### Borda

| Uso | Claro | Escuro |
|---|---|---|
| Card/container | `border-slate-200` | `dark:border-slate-700` |
| Input | `border-slate-300` | `dark:border-slate-600` |
| Input focus | `border-emerald-500` | (mesmo) |
| Divisória | `border-slate-200` | `dark:border-slate-700` ou `dark:border-slate-600` |
| Topbar | `border-slate-200/80` | `dark:border-slate-700/80` |
| Modal | `border-slate-200` | `dark:border-slate-700` |

### Texto

| Uso | Claro | Escuro |
|---|---|---|
| Título principal | `text-slate-900` | `dark:text-slate-100` |
| Texto corpo | `text-slate-700` | `dark:text-slate-300` |
| Texto secundário | `text-slate-500` | `dark:text-slate-400` |
| Placeholder | `text-slate-400` | (mesmo) |
| Acento (emerald) | `text-emerald-600` / `text-emerald-700` | `dark:text-emerald-400` |
| Destrutivo | `text-rose-600` / `text-rose-700` | `dark:text-rose-400` |
| Erro | `text-rose-600` | (mesmo) |

### Acento Verde/Emerald

Usado para:
- Botão primário (`bg-emerald-600`, `hover:bg-emerald-700`)
- Labels superiores (eyebrow): `text-emerald-600` ou `text-emerald-500`
- Link/ativo na sidebar: `text-emerald-700` + `bg-emerald-50`
- Badge success: `bg-emerald-50 text-emerald-700 ring-emerald-200`
- Item ativo em dropdown: `bg-emerald-50 text-emerald-700`
- Indicador de notificação não lida: borda verde
- Input focus: `focus:ring-emerald-100` / `focus:border-emerald-500`

### Cuidados com Dark Mode

- Sempre incluir `dark:` nos bg, text, border e ring
- Fundos dark evitam preto absoluto: usam `slate-800`, `slate-900` ou `slate-700/40`
- Cards em dark mode usam `dark:bg-slate-800` — tom azulado, não preto
- Overlay de modal usa `bg-slate-950/40` — tom escuro translúcido, não preto opaco
- Dropdowns dark: `dark:bg-slate-800` (ou `dark:bg-slate-900` no Select) com `dark:border-slate-700`
- Elementos com `backdrop-blur` (topbar, header modal) usam bg semitransparente:
  `dark:bg-slate-800/95` no modal, `dark:bg-slate-800/80` no topbar
- Sombras (`shadow-soft`, `shadow-glow`) não têm contraparte dark explícita — confiam que o bg escuro já elimina a necessidade

---

## 3. Tipografia

### Stack
```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Padrões

| Elemento | Classes | Tamanho | Peso |
|---|---|---|---|
| Eyebrow (label superior) | `text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-400` | 12px | 600 |
| Título de página | `text-3xl font-semibold tracking-tight sm:text-4xl` | 30px→36px | 600 |
| Título de card/modal | `text-lg font-semibold` a `text-xl font-bold` | 18-20px | 600-700 |
| Subtítulo | `text-sm leading-6 text-slate-500 dark:text-slate-400` | 14px | 400 |
| Label de form | `text-sm font-medium text-slate-700 dark:text-slate-300` | 14px | 500 |
| Texto de input | `text-slate-900 dark:text-slate-100` | 14-16px | 400 |
| Texto auxiliar | `text-xs text-slate-500 dark:text-slate-400` | 12px | 400 |
| Botão | `text-sm font-semibold` | 14px | 600 |
| Badge | `text-xs font-semibold` | 12px | 600 |
| Seção sidebar | `text-[11px] font-semibold uppercase tracking-wider` | 11px | 600 |
| Table header | `text-xs font-semibold uppercase tracking-wider` | 12px | 600 |

### Hierarquia Visual Recomendada

```
E Y E B R O W                  → 11-12px, uppercase, tracking amplo, emerald
┌────────────────────────────────────────────┐
│                                            │
│  TÍTULO PRINCIPAL           → 30-36px,    │
│  tracking-tight, semibold                  │
│                                            │
│  Subtítulo descritivo       → 14px,       │
│  text-slate-500                            │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. Headers de Páginas e Modais

### PageHeader (componente reutilizável: `frontend/src/components/ui/PageHeader.jsx`)

```
┌─────────────────────────────────────────────────┐
│  FINANCE AI                        [Ação]       │  ← eyebrow: text-sm font-semibold uppercase
│                                                   │     tracking-[0.24em] text-emerald-600
│  Título da Página                                 │  ← h1: text-3xl font-semibold tracking-tight
│                                                   │     text-slate-900 dark:text-slate-100
│  Descrição explicativa do conteúdo...             │  ← p: text-sm leading-6 text-slate-500
│                                                   │     dark:text-slate-400
└─────────────────────────────────────────────────┘
```

**Estrutura do PageHeader:**
- Card como container: `rounded-[28px] border p-6 sm:p-8 shadow-soft`
- Flex row em desktop (`lg:flex-row lg:items-end lg:justify-between`)
- Eyebrow estático: "Finance AI" (emerald-600, sem dark variant neste componente)
- Título: escalável de 3xl a 4xl
- Descrição opcional com `max-w-2xl`

### Modal Header (componente `Modal.jsx` e `FormModal.jsx`)

```
┌─────────────────────────────────────────────────┐
│  [eyebrow]                          [✕]        │  ← header: sticky, border-b, bg-white/95
│  Título do Modal                                 │     backdrop-blur
│                                                   │
├─────────────────────────────────────────────────┤
│  Body do modal...                                │
│                                                   │
├─────────────────────────────────────────────────┤
│  [Cancelar]  [Salvar]                           │  ← footer: border-t, bg-white/95
└─────────────────────────────────────────────────┘
```

**Estrutura do Modal Header:**
- Header: `sticky top-0 z-10 border-b bg-white/95 backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95`
- Eyebrow (opcional): `text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500/600 dark:text-emerald-400`
- Título com eyebrow: `mt-2 text-xl font-bold leading-tight md:text-2xl`
- Título sem eyebrow: `text-lg font-semibold md:text-xl` (Modal) ou `text-xl` (FormModal)
- Botão fechar: `variant="ghost" size="sm"` com ícone X
- Padding: `px-5 py-4 md:px-6 md:py-5`
- **Importante**: header e footer usam `bg-white/95` (mesma família do body `bg-white`)

### Dashboard Page Header (padrão in-line)

Segue o mesmo padrão do PageHeader mas implementado diretamente na página:
- Card container com flex-row
- Eyebrow: "Finance AI" (`text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600`)
- Título: saudação personalizada com `text-3xl font-semibold tracking-tight sm:text-4xl`
- Subtítulo: "Aqui está o resumo da sua vida financeira hoje."

### O que evitar em headers

- Eyebrow sem dark mode: alguns lugares usam `text-emerald-600` sem `dark:text-emerald-400` — corrigir ao tocar no arquivo
- Headers sem eyebrow/identidade: páginas devem sempre ter um label superior
- Tarjas pretas no header de modal: usar `bg-white/95` ou `dark:bg-slate-800/95`, nunca preto absoluto
- Headers genéricos sem personalidade: incluir um label descritivo (ex: "Finance AI", "Workspace", "Painel Administrativo")

---

## 5. Layout Principal

### Estrutura (`frontend/src/layouts/AppLayout.jsx`)

```
┌──────────────────────────────────────────────────┐
│ ┌──────────┐  ┌────────────────────────────────┐│
│ │          │  │  T O P B A R                   ││  ← não rola, absolute no topo
│ │ SIDEBAR  │  │  (flutuante, backdrop-blur)    ││
│ │          │  ├────────────────────────────────┤│
│ │ fixa     │  │                                ││
│ │ 72 w     │  │   C O N T E Ú D O              ││  ← scrolla (scrollbar-none)
│ │          │  │                                ││
│ │          │  │                                ││
│ │          │  │                                ││
│ │          │  │                                ││
│ └──────────┘  └────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### Regras de Layout

1. **Sidebar fixa**: `hidden lg:block h-full w-72 shrink-0 overflow-hidden`
2. **Topbar flutuante**: absolute com `pointer-events-none` no wrapper, `pointer-events-auto` no topbar
3. **Conteúdo rola**: `scrollbar-none overflow-y-auto overflow-x-hidden`
4. **Topbar não rola com a página**: fica fixo no topo via posicionamento absolute
5. **Barra de rolagem oculta**: classe `scrollbar-none` (definida no `index.css`)
6. **Conteúdo parece rolar por baixo do topbar**: padding-top `pt-[112px]` no main
7. **Container centralizado**: `mx-auto max-w-content` (1600px) com padding `px-4 py-5 sm:px-6 lg:px-6 xl:px-8`
8. **Gap entre sidebar e conteúdo**: `gap-5 lg:gap-6`
9. **Background geral**: `bg-slate-50 dark:bg-slate-950 transition-colors`

### Espaçamentos Principais

- Sidebar: `w-72`
- Padding interno do container: `px-4 py-5` → `sm:px-6` → `lg:px-6` → `xl:px-8`
- Gap sidebar-conteúdo: `gap-5` → `lg:gap-6`
- Padding top do conteúdo: `pt-[112px]` (altura do topbar + espaçamento)
- Espaçamento entre elementos: `space-y-7` ou `space-y-8`

### AdminLayout

Segue o mesmo padrão, mas com acento amber (`border-amber-200`, `text-amber-600`, etc.) e sem backdrop-blur no header.

---

## 6. Cards

### Card Padrão (`frontend/src/components/ui/Card.jsx`)

```jsx
className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft w-full max-w-full dark:border-slate-700 dark:bg-slate-800"
```

| Propriedade | Claro | Escuro |
|---|---|---|
| Border radius | `rounded-[28px]` | (mesmo) |
| Borda | `border-slate-200` | `dark:border-slate-700` |
| Background | `bg-white` | `dark:bg-slate-800` |
| Sombra | `shadow-soft` (drop: 0 12px 30px rgba(15,23,42,0.06)) | removida |
| Padding | `p-6` | (mesmo) |
| Width | `w-full max-w-full` | (mesmo) |

### Variações de Card

- **PageHeader**: `className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between"`
- **EmptyState**: `className="flex flex-col items-center px-6 py-12 text-center"`
- **Card de erro**: `className="rounded-[28px] border-rose-200 bg-rose-50 p-6"`
- **Card de alerta**: `className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"`
- **Card de preview**: `className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"`
- **Card de info**: `className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4"`
- **Card de warning/info agrupado**: `className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600/70 dark:bg-slate-800/40"`
- **Card de highlight**: `className="rounded-[24px] border p-4 transition"` com `border-emerald-200 bg-emerald-50/70`

### Estados Hover

Cards não têm hover padrão. Hover é aplicado por componentes filhos (links, botões).

---

## 7. Formulários e Modais

### Input (`frontend/src/components/ui/Input.jsx`)

| Estado | Claro | Escuro |
|---|---|---|
| Normal | `border-slate-300 bg-white` | `dark:border-slate-600 dark:bg-slate-700/40` |
| Focus | `border-emerald-500 ring-4 ring-emerald-100` | `dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30` |
| Error | `border-rose-300 focus:border-rose-400 focus:ring-rose-100` | `dark:border-rose-600 dark:focus:border-rose-500 dark:focus:ring-rose-900/30` |
| Disabled | Not implemented (usar classes externas) | |
| Placeholder | `text-slate-400` | (mesmo) |

- Altura: `py-3` (ou `h-11 py-0 text-sm` via fieldClassName nos forms)
- Border-radius: `rounded-2xl`
- Label: `text-sm font-medium text-slate-700 dark:text-slate-300` (fora do input, via `<label>`)
- Error message: `text-sm text-rose-600` (abaixo do input)

### Select (`frontend/src/components/ui/Select.jsx`)

Custom select com dropdown estilizado:
- Aparência similar ao input (rounded-2xl, mesma altura, foco e erro)
- Dropdown aberto: `fixed z-50` com posição calculada via JS (`menuStyle`)
- Opção selecionada: `bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100`
- Opção hover: `hover:bg-emerald-50 hover:text-emerald-700`
- Dropdown container: `rounded-2xl border bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900`
- Ícone de chevron com rotação 180° quando aberto

### Textarea

Segue o mesmo padrão do input:
```jsx
className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm
outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4
focus:ring-emerald-100 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-100
dark:placeholder:text-slate-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
```

### Dropdowns (genéricos, ex: usuário, tema)

| Propriedade | Claro | Escuro |
|---|---|---|
| Container | `border-slate-200 bg-white` | `dark:border-slate-600 dark:bg-slate-800` |
| Item normal | `text-slate-600 hover:bg-slate-50` | `dark:text-slate-400 dark:hover:bg-slate-700/50` |
| Item ativo | `bg-emerald-50 text-emerald-700` | `dark:bg-emerald-900/30 dark:text-emerald-400` |
| Item destrutivo | `hover:bg-rose-50 hover:text-rose-700` | `dark:hover:bg-rose-900/20 dark:hover:text-rose-400` |
| Divisória | `border-t border-slate-200` | `dark:border-slate-600` |
| Border-radius | `rounded-2xl` (outer), `rounded-xl` (items) | (mesmo) |
| Sombra | `shadow-lg` | (mesmo) |
| Z-index | `z-50` | (mesmo) |

### Modal Container

Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm`

Modal body:
```
flex max-h-[88vh] w-full flex-col overflow-hidden
rounded-2xl
border border-slate-200 dark:border-slate-700
bg-white dark:bg-slate-800
shadow-2xl
max-w-2xl (default, configurável)
```

### FormModal

Similar ao Modal com diferenças:
- `maxWidth` padrão: `max-w-4xl`
- Footer com `flex flex-col-reverse gap-3 sm:flex-row sm:justify-end`
- Header/body/footer mantêm `bg-white` / `dark:bg-slate-800` — mesma família
- Divisórias sutis: `border-b` e `border-t` com `border-slate-200`
- Header/footer com `bg-white/95 backdrop-blur` — sem tarjas pretas

### Formulários (padrão)

- Grid responsivo: `grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4`
- Inputs com `fieldClassName: h-11 py-0 text-sm`
- Campos full-width: `md:col-span-2`
- Checkbox: `className="h-4 w-4 rounded border-slate-300 text-emerald-600"`
- Container de agrupamento: `rounded-2xl border p-4`
- Mensagem de erro: `rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700`
- Card de info/info: `rounded-2xl border border-blue-200 bg-blue-50/50 p-4`

---

## 8. Botões

### Padrão Base
```jsx
inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition
focus-visible:outline-none focus-visible:ring-4
disabled:cursor-not-allowed disabled:opacity-60
```

### Variantes

| Variante | Normal | Hover | Focus Ring |
|---|---|---|---|
| **primary** | `bg-emerald-600 text-white` | `hover:bg-emerald-700` | `focus-visible:ring-emerald-200` |
| **secondary** | `border border-slate-200 bg-white text-slate-700` | `hover:bg-slate-50` | `focus-visible:ring-slate-200` |
| **danger** | `bg-rose-600 text-white` | `hover:bg-rose-700` | `focus-visible:ring-rose-200` |
| **ghost** | `text-slate-600` | `hover:bg-slate-100 hover:text-slate-900` | `focus-visible:ring-slate-200` |

### Secondary Dark Mode
```
dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
```

### Ghost Dark Mode
```
dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200
```

### Sizes

| Size | Altura | Padding Horizontal | Text Size |
|---|---|---|---|
| `sm` | `h-9` | `px-4` | `text-sm` |
| `md` | `h-11` | `px-5` | `text-sm` |
| `lg` | `h-12` | `px-6` | `text-base` |

### Botão Fechar (Modal)

```jsx
<Button variant="ghost" size="sm">
  <X className="h-4 w-4" />
</Button>
```

### Estados

- **Disabled**: `disabled:cursor-not-allowed disabled:opacity-60`
- **Loading**: usar estado `disabled` + ícone `Loader2` com `animate-spin`

---

## 9. Responsividade

### Mobile (default, < 640px)

- Sidebar escondida, substituída por overlay: `fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm`
- Botão hamburger no topbar (`Menu` icon, visível apenas `lg:hidden`)
- Sidebar mobile: `max-w-xs` com padding `p-4`
- Conteúdo ocupa 100% da largura
- Grids de cards em coluna única
- Formulários em coluna única (`grid-cols-1`)
- PageHeader muda para coluna
- Topbar: label workspace + ações sempre visíveis, dropdown de usuário sem texto lateral
- Cards: padding reduzido (`p-6` vs `p-6 sm:p-8`)

### Tablet (sm: 640px+)
- Padding lateral: `sm:px-6`
- Cards: `sm:p-8`

### Desktop (lg: 1024px+)
- Sidebar visível: `lg:block`
- Gap maior: `lg:gap-6`
- Layout em linha: `lg:flex-row`
- Padding: `lg:px-6`

### Widescreen (xl: 1280px+)
- Padding lateral: `xl:px-8`

### Ajustes Específicos

- **Modais**: `p-4` (mobile), body `px-5` / `md:px-6`
- **Topbar**: botão menu `lg:hidden`, ThemeToggle `hidden sm:contents`
- **Cards de grid**: `grid gap-5 md:grid-cols-2 xl:grid-cols-4`
- **Formulários**: `grid-cols-1 md:grid-cols-2`
- **Footer de modal**: `flex-col-reverse gap-3 sm:flex-row sm:justify-end`
- **Select**: posição dropdown calculada dinamicamente via `getBoundingClientRect`

---

## 10. Componentes Específicos

### Sidebar (`frontend/src/components/layout/Sidebar.jsx`)

- Container: `rounded-[28px] border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-800`
- Logo: `h-11 w-11 rounded-2xl bg-emerald-600` com ícone `Sparkles`
- Navegação agrupada com seções (títulos: `text-[11px] font-semibold uppercase tracking-wider text-slate-400`)
- Links: `rounded-2xl px-4 py-3 text-sm font-medium`
- Link ativo: `bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800`
- Link inativo: `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
- Logout: `hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20 dark:hover:text-rose-400`
- Scroll: `scrollbar-none`

### Topbar (`frontend/src/components/layout/Topbar.jsx`)

- Container: `rounded-[28px] border border-slate-200/80 bg-white/85 shadow-soft backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-800/80`
- Espaçamento: `px-4 py-4`
- Label workspace: `text-[11px] uppercase tracking-[0.28em] text-slate-500`
- Nome workspace: `text-sm font-semibold text-slate-900`
- Avatar: `h-10 w-10 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400`
- Ícones ação: `h-9 w-9 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50`

### Dashboard

- Card de boas-vindas: mesmo padrão PageHeader (eyebrow + título + descrição + ação)
- Grid de cards: `grid gap-5 md:grid-cols-2 xl:grid-cols-4` (overview)
- Grid de widgets maiores: `grid gap-5 md:grid-cols-3`
- Grid de duas colunas: `grid gap-5 xl:grid-cols-2`
- Espaçamento entre seções: `space-y-7`
- Loading skeleton: `animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700`
- Card de erro: `rounded-[28px] border-rose-200 bg-rose-50 p-8`

### Modais de Cadastro (FormModal)

- Ver seção 7 (Formulários e Modais)
- Footer: botões alinhados à direita em desktop, empilhados em mobile
- Salvar: botão primary, Cancelar: botão secondary

### Tela de Nova Transação

- FormModal com `max-w-4xl`
- Formulário em grid 2 colunas
- Seção de cartão/conta: `rounded-2xl border p-3` com destaque sutil
- Checkbox de parcela: `rounded-2xl border bg-slate-50 px-4 py-2.5`

### Calendário (`FinancialCalendarPage.jsx`)

- PageHeader + Select de filtro + navegação `ChevronLeft`/`ChevronRight`
- Grid de dias: cabeçalho com `text-xs font-semibold uppercase tracking-wider`
- Badges de status: `PAID` → success, `PENDING` → warning

### Notificações

- Notificação não lida: `border-l-2 border-emerald-500 bg-emerald-50/50`
- Ícone por tipo: configurado em `typeConfig`

### Avatar/Perfil

- Iniciais: função `getInitials()` (até 2 primeiras letras)
- Container: `flex h-10 w-10 rounded-full bg-emerald-50 items-center justify-center`
- Com imagem: `h-full w-full object-cover`
- Cores: `text-emerald-700 dark:text-emerald-400` com `dark:bg-emerald-900/30`

### Dropdowns em Dark Mode

Todos seguem o mesmo padrão:
```
border-slate-200 bg-white                   →  dark:border-slate-600 dark:bg-slate-800
text-slate-600 hover:bg-slate-50            →  dark:text-slate-400 dark:hover:bg-slate-700/50
bg-emerald-50 text-emerald-700              →  dark:bg-emerald-900/30 dark:text-emerald-400
hover:bg-rose-50 hover:text-rose-700        →  dark:hover:bg-rose-900/20 dark:hover:text-rose-400
```

---

## 11. Boas Práticas

1. **Dark mode obrigatório**: todo componente visual deve ter variante `dark:` para bg, text, border e ring. Nunca usar cor fixa sem contraparte escura.

2. **Cores com variante**: preferir `text-slate-*`/`bg-slate-*` sobre cores fixas hex. Usar `dark:` sempre.

3. **Scrollbar invisível**: usar classe `scrollbar-none` em containers com overflow. Definida globalmente no `index.css`.

4. **Evitar mudanças agressivas**: transições sutis (`transition-colors`, `transition`) sem duration explícito (default 150ms).

5. **Consistência entre páginas**: usar `PageHeader` para cabeçalhos, `Card` para containers, `FormModal` para formulários modais.

6. **Reutilização antes de criar**: antes de criar um novo componente visual, verificar se já existe padrão:
   - `components/ui/` para componentes base (Button, Card, Input, Select, Modal, Badge, LoadingSkeleton, EmptyState, PageHeader)
   - `components/layout/` para layout (Sidebar, Topbar, ThemeToggle)
   - `components/notifications/`, `components/accounts/`, `components/transactions/` para específicos de domínio

7. **Sombras**: em dark mode, remover sombras ou usar `shadow-*` escura específica (`dark:shadow-black/30` no Select).

8. **Backdrop**: ao usar backdrop-blur, garantir bg semitransparente (`bg-white/85` ou `bg-white/95`).

9. **Rounded**: consistência nos valores:
   - Container de página/card: `rounded-[28px]`
   - Input/select/button: `rounded-2xl`
   - Dropdown items/avatares: `rounded-xl`
   - Badges: `rounded-full`
   - Ícones container (EmptyState): `rounded-2xl`

10. **Gap vs Space**: preferir `gap-*` em grids/flex containers, `space-y-*` em colunas verticais.

---

## 12. Checklist para Futuras Alterações de UI

### Geral
- [ ] O componente tem variante `dark:` para todas as cores (bg, text, border, ring)?
- [ ] Usa classes do Tailwind consistentes com o projeto (slate, emerald, rose)?
- [ ] O border-radius segue os padrões do projeto (rounded-2xl, rounded-[28px], rounded-full)?
- [ ] A transição é suave (pelo menos `transition`)?
- [ ] `scrollbar-none` está aplicado em containers com overflow?

### Header/PageHeader
- [ ] Tem eyebrow (label superior, uppercase, tracking amplo, emerald)?
- [ ] O título é claro e em negrito/semibold?
- [ ] Tem subtítulo descritivo quando necessário?
- [ ] Dark mode está correto (text-slate-100 para título)?

### Card
- [ ] Usa `Card` de `components/ui/Card.jsx`?
- [ ] Border-radius `rounded-[28px]`?
- [ ] Padding `p-6`?
- [ ] Dark mode com `dark:bg-slate-800 dark:border-slate-700`?

### Modal
- [ ] Usa `Modal` ou `FormModal` de `components/ui/`?
- [ ] Overlay com `bg-slate-950/40 backdrop-blur-sm`?
- [ ] Header com `bg-white/95 dark:bg-slate-800/95` (não preto)?
- [ ] Body com `bg-white dark:bg-slate-800` (mesma família)?
- [ ] Footer com `bg-white/95 dark:bg-slate-800/95`?
- [ ] Divisórias sutis (`border-slate-200 dark:border-slate-700`)?
- [ ] Eyebrow no header quando aplicável?

### Formulários
- [ ] Inputs com `rounded-2xl`?
- [ ] Focus ring emerald (`focus:ring-emerald-100`)?
- [ ] Label com `text-sm font-medium text-slate-700 dark:text-slate-300`?
- [ ] Grid responsivo (`md:grid-cols-2`)?
- [ ] Mensagens de erro com `rounded-2xl border-rose-200 bg-rose-50`?

### Botões
- [ ] Usa `Button` de `components/ui/Button.jsx`?
- [ ] Variante correta (primary, secondary, danger, ghost)?
- [ ] Disabled com `disabled:cursor-not-allowed disabled:opacity-60`?
- [ ] Dark mode nas variantes secondary e ghost?

### Dropdown
- [ ] Container dark: `dark:bg-slate-800 dark:border-slate-600`?
- [ ] Items com hover dark: `dark:hover:bg-slate-700/50`?
- [ ] Item ativo dark: `dark:bg-emerald-900/30 dark:text-emerald-400`?

### Responsividade
- [ ] Funciona em mobile (sidebar oculta, grid coluna única)?
- [ ] Sidebar overlay com `backdrop-blur-sm` em mobile?
- [ ] Botão hamburger visível apenas em mobile (`lg:hidden`)?
- [ ] Formulários adaptam para coluna única em mobile?
- [ ] Elementos não quebram nem desalinham em telas pequenas?

### Acessibilidade
- [ ] Botões têm `aria-label` quando sem texto visível?
- [ ] Menus dropdown têm `aria-expanded` e `aria-haspopup`?
- [ ] Select custom tem `role="combobox"` e `role="listbox"`?
- [ ] Fechamento com `Escape` implementado em modais?
- [ ] Foco visível com `focus-visible:outline-none focus-visible:ring-4`?
