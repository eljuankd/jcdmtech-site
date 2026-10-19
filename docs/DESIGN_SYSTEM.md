# Sistema de diseño — JCDM Technologies LLC

> Actualizado: 2026-10-19 (Fase 1). Se conserva íntegra la especificación "Direction C" (junio 2026) en §3 porque
> sigue siendo la base de `styles.css`; §2 documenta cómo se desvió el sitio desde entonces y §5 la propuesta.

---

## 1. Resumen del estado [VERIFICADO]

- Hay **dos lenguajes visuales conviviendo**:
  1. **Direction C** (global, `styles.css`): negro `#09090B` / crema `#F5F0E8` / oro `#C8A96E`, componentes rectangulares, secciones alternas oscuro/crema. Lo usan services, projects, about, contact, legal, auth, admin, music-ride.
  2. **Estilo "QUELVO / Blacklane-inspired"** (inline en `index.html` y `quelvo/index.html`): fotos a sangre completa con zoom lento (Ken Burns), degradados oscuros, negro `#05050A`, tipografía Fraunces muy grande con `letter-spacing:-.03em`, botones fantasma, radio 2 px.
- El estilo 2 **rompe reglas** de Direction C (gradientes sobre secciones, sin alternancia crema). Fue un cambio deliberado (commits `68c4ac5`, `29c4b6f`) no reflejado hasta ahora en este documento.
- Tema claro (`.light-mode`) existe y redefine `--bg`, `--text`, `--card`, etc.; las páginas con tokens inline (`--jh-*`, `--q-*`) **no** responden al tema claro de forma completa [INFERIDO por los valores fijos].
- No hay `prefers-reduced-motion` en todo el sitio, pese a animaciones infinitas en los heros.
- Sólo hay 1 regla `:focus-visible` en `styles.css`.

---

## 2. Identidad visual existente

### 2.1 Tokens globales (`styles.css :root`)

| Token | Oscuro (defecto) | `.light-mode` | Uso |
|---|---|---|---|
| `--bg` | `#09090B` | `#F8F7F5` | Fondo de sección |
| `--bg-alt` | `#F5F0E8` | — | Secciones crema |
| `--text` | `#EDEFF3` | `#09090B` | Texto |
| `--text-on-light` | `#09090B` | — | Texto sobre crema |
| `--muted` | `#8A9099` | `#52525B` | Texto secundario |
| `--muted-on-light` | `#52525B` | — | Secundario sobre crema |
| `--card` / `--card-solid` | `#111318` | `#FFFFFF` | Tarjetas |
| `--border` | `rgba(255,255,255,.09)` | `rgba(0,0,0,.10)` | Bordes |
| `--border-light` | `rgba(0,0,0,.11)` | — | Bordes sobre crema |
| `--gold` | `#C8A96E` | igual | Acento |
| `--gold-line` | `rgba(200,169,110,.28)` | `.38` | Líneas finas |
| `--shadow` | `0 2px 20px rgba(0,0,0,.4)` | `0 2px 12px rgba(0,0,0,.08)` | Sombra |

### 2.2 Tokens de página (duplicados)

| Archivo | Tokens |
|---|---|
| `index.html` | `--jh-black #05050A`, `--jh-gold #C8A96E`, `--jh-muted`, `--jh-border` |
| `quelvo/index.html` | `--q-black #05050A`, `--q-white #F2F2F5`, `--q-gold #C8A96E`, `--q-muted`, `--q-border`, `--q-r 2px` |

### 2.3 Tipografía
- Titulares: **Fraunces** 600/700 (Google Fonts, opsz 9..144).
- Texto/UI: **Inter** 400/500/600.
- Marca: wordmark tipográfico "JCDM" en Fraunces (no hay logo QUELVO gráfico; QUELVO se escribe en texto).

### 2.4 Imágenes
- `assets/home/*` y `assets/quelvo/*`: fotografías generadas por IA (commit `68c4ac5`), PNG 0,8–1,7 MB.
- Vehículos mostrados como "Mercedes E-Class or similar", "Cadillac Escalade or similar".
- Iconografía: emojis y caracteres (→, ⏱, ✉, 📱…), no hay set de iconos SVG.

### 2.5 Breakpoints en uso
480 · 600 · 640 · 700 · 768 · 800 · **880 (nav móvil)** · 960 · 1024 px.

---

## 3. Especificación "Direction C" (junio 2026 — vigente para páginas globales)

Estilo editorial de alto contraste inspirado en impresos de lujo. Sin glassmorphism ni blur.

### Escala tipográfica
| Elemento | Tamaño | Peso | Notas |
|---|---|---|---|
| Hero H2 | `clamp(3rem, 5.5vw + 1rem, 6rem)` | 700 | Fraunces, line-height 1.0 |
| Section H2 | `clamp(1.5rem, 2.8vw + .6rem, 2.2rem)` | 700 | Fraunces, line-height 1.1 |
| H3 | `clamp(1.1rem, 1.4vw + .8rem, 1.35rem)` | 700 | Fraunces |
| Body | 1rem | 400 | Inter |
| Small/muted | 0.88–0.95rem | 400 | Inter |
| Kicker | 0.75–0.78rem | 700 | Inter, mayúsculas, letter-spacing .12em |
| Botón | 0.9rem | 600–700 | Inter, letter-spacing .025em |

### Espaciado
| Token | Valor |
|---|---|
| `.section` padding | 88px 0 (64px < 768px) |
| `.hero-section` padding | 96px 0 80px |
| `.card` padding | 28px 26px 24px |
| `.container` max-width | 1100px, gutter `clamp(16px, 4vw, 24px)` |

### Componentes
- **Secciones:** `.section` oscuro; `.section.alt` crema con bordes `--gold-line`; `h2::after` línea dorada 36 px.
- **Cards:** `background: var(--card)`, `border: 1px solid var(--border)`, `border-radius: 4px`; sobre crema fondo blanco; hover borde dorado; viñetas = línea dorada de 5 px.
- **Botones:** `.btn` transparente borde fino; `.btn-primary` relleno oro, texto `#09090B`; `.btn-outline` borde oro. Radio 4 px, nunca píldora. En `.section.alt` el primario pasa a negro con texto crema.
- **Nav:** fondo sólido `--bg`, borde inferior `--gold-line`, 68 px de alto, wordmark Fraunces 1.35rem.
- **FAQ:** `details.faq`, sólo borde inferior, `+` dorado que rota a `×`.
- **Kicker:** oro, mayúsculas, `.16em`, .75rem, 700.
- **Stats bar:** fondo crema, valores Fraunces oro.

### Rejillas
| Clase | Columnas |
|---|---|
| `.services-grid` | 3 → 2 (1024) → 1 (640) |
| `.platforms-grid` | 2 → 1 (640) |
| `.why-grid` | 4 → 2 (1024) → 1 (640) |
| `.grid-2` / `.grid-3` | 2 o 3 → 1 (800) |

### Reglas originales de Direction C
1. Sin `border-radius > 6px` en componentes interactivos.
2. Sin `backdrop-filter` ni blur.
3. Sin degradados de fondo en secciones. *(Incumplida en Home/QUELVO desde jun. 2026.)*
4. Sin sombras con spread > 2px.
5. Alternar secciones oscuro/crema. *(Incumplida en Home/QUELVO.)*
6. Oro reservado para acentos, kickers, botón primario, subrayado de h2, cifras.
7. Fraunces sólo en titulares; Inter en todo lo demás.

### QUELVO (regla original)
Mismo sistema con más aire, oro más presente, tarjetas de flota horizontales, wordmark QUELVO grande.

---

## 4. Problemas de diseño a resolver

| ID | Problema | Fase |
|---|---|---|
| DS-1 | Dos lenguajes visuales sin decisión formal | 2 (decidir), 3–7 (aplicar) |
| DS-2 | Tokens duplicados `--jh-*`, `--q-*` y negro `#05050A` vs `#09090B` | 2 |
| DS-3 | CSS inline extenso (QUELVO 369 líneas, Music Ride 102, booking 88, Home 85) | 2–5 |
| DS-4 | Sin `prefers-reduced-motion` para Ken Burns/animaciones | 2 |
| DS-5 | Foco visible mínimo; contraste de `--muted` sobre fondos fotográficos sin medir | 2 / 8 |
| DS-6 | Iconos emoji (render distinto por SO, lectores de pantalla) | 3 |
| DS-7 | Breakpoints dispersos | 2 / 8 |
| DS-8 | Tema claro incompleto en páginas con tokens propios | 2–4 |
| DS-9 | Imágenes pesadas | 2 / 4 |

---

## 5. Propuesta [PLANIFICADO — requiere aprobación en Fase 2]

1. **Adoptar el estilo QUELVO/premium oscuro como lenguaje principal** de JCDM (es el más reciente y el que el propietario eligió para Home y QUELVO), conservando de Direction C: tokens, rectangularidad (radio 2–4 px), Fraunces + Inter, oro como acento escaso.
2. Un solo juego de tokens en `styles.css`: `--color-bg #09090B` (decidir si unificar con `#05050A`), `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--line`, `--radius-sm 2px`, `--radius 4px`, escala de espaciado `--space-1…8`, escala tipográfica con `clamp()`.
3. Componentes compartidos con prefijo neutro (p. ej. `.hero-photo`, `.btn-ghost`, `.feature-card`) en lugar de `qlv-*` / `jh-*` cuando se usen en más de una página.
4. Breakpoints canónicos: 640 / 880 / 1024 px.
5. `@media (prefers-reduced-motion: reduce)` desactiva Ken Burns y transiciones.
6. QUELVO conserva sub-identidad (wordmark, fotografía de flota) dentro del mismo sistema.
7. Identidad original: no reutilizar textos, iconografía, layout pixel a pixel ni assets de Blacklane.
