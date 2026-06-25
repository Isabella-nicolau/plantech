# Plantech — Design System

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0A0D0B` | Fundo da aplicacao |
| `--surface` | `#131914` | Cards, paineis |
| `--surface-2` | `#1A211C` | Superficies elevadas |
| `--accent` | `#6BB536` | Cor primaria (folha) — botoes, links, indicadores |
| `--accent-hover` | `#5FA52E` | Hover do acento |
| `--earth` | `#C4986C` | Cor secundaria quente (terra/madeira) |
| `--text` | `#E2E8E4` | Texto principal |
| `--text-secondary` | `#94A39A` | Texto complementar |
| `--text-muted` | `#5E6E64` | Labels, placeholders, info terciaria |
| `--success` | `#5AAE3B` | Feedback positivo |
| `--warning` | `#D4952B` | Alertas |
| `--error` | `#D94848` | Erros e acoes destrutivas |
| `--info` | `#4A90D9` | Informacao neutra |

## Tipografia

| Papel | Fonte | Pesos | Uso |
|---|---|---|---|
| Display | Space Grotesk | 500, 600, 700 | h1–h4, KPI values, logo, titulos de card |
| Body | IBM Plex Sans | 400, 500, 600 | Corpo, labels, botoes, tabelas |

### Escala

| Token | Tamanho | Equivalente |
|---|---|---|
| `--text-xs` | 0.75rem | 12px |
| `--text-sm` | 0.8125rem | 13px |
| `--text-base` | 0.875rem | 14px |
| `--text-md` | 1rem | 16px |
| `--text-lg` | 1.125rem | 18px |
| `--text-xl` | 1.375rem | 22px |
| `--text-2xl` | 1.75rem | 28px |
| `--text-3xl` | 2.25rem | 36px |

## Espacamento

Base de 4px. Tokens: `--space-1` (4px) ate `--space-9` (64px).

## Raios de borda

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | 3px | Badges |
| `--radius-sm` | 5px | Inputs, botoes |
| `--radius-md` | 8px | Cards menores, nav links |
| `--radius-lg` | 12px | Cards, paineis |
| `--radius-xl` | 16px | Login container |

## Sombras

Neutras (preto puro), sem halo colorido:
- `--shadow-sm`: hover sutil
- `--shadow-md`: cards elevados
- `--shadow-lg`: modais e dropdowns
- `--shadow-xl`: login container

## Principios de movimento

### Duracoes
- `--dur-fast` (140ms): hover, active, focus
- `--dur-base` (200ms): mudancas de estado
- `--dur-slow` (320ms): transicoes maiores
- `--dur-enter` (400ms): entrada de elementos

### Easing
- `--ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)` — inicio rapido, desaceleracao suave
- `--ease-in-out`: `cubic-bezier(0.45, 0, 0.55, 1)` — simetrico

### Onde animar
- **Hover de botoes/links**: scale(0.97) no active
- **Hover de cards/nav-cards**: translateY(-2px) + shadow
- **Hover de linhas de tabela**: background sutil
- **Sidebar links**: translateX(2px) no hover
- **Entrada de pagina**: fadeInUp com stagger (classe `.stagger`)
- **KPI numbers**: count-up com easing cubico
- **Alertas**: slideInRight
- **Login form**: stagger nos campos

### prefers-reduced-motion
Todas as animacoes sao desabilitadas via `@media (prefers-reduced-motion: reduce)`.
Elementos ficam visiveis sem transicao. Count-up em JS tambem respeita a preferencia.

## Acessibilidade

- `:focus-visible` com outline de 2px na cor de acento em todos os interativos
- Contraste minimo AA em texto sobre superficies escuras
- Labels `for` vinculados aos inputs
- `aria-label` nos botoes sem texto
- `role="navigation"` na sidebar

## Organizacao CSS

1. `style.css` — base, layout, componentes existentes
2. `css/theme.css` — tokens, tipografia, motion, overrides de refinamento

O theme.css carrega apos style.css e sobreescreve os tokens `:root`.
