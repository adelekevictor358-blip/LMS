# Mountain Top University — Portal Design System

> The single source of truth for the UI refactor. Every page and component MUST follow this.
> Direction: **Modern Institutional**. Calm, trustworthy, academic. Refined light + dark.

---

## 0. Golden rules (read first)

1. **Preserve all functionality.** Never change Zustand store usage (`useStore`, selectors, actions),
   routing (`useRouter`, `usePathname`, `redirect`, `next/link`), form handlers, validation logic,
   `onClick`/`href`, component props, or data computations. **Only change presentation:** JSX
   structure, classNames, copy, and styling. Keep `"use client"` directives.
2. **Token-first.** Style with the semantic Tailwind classes below (`bg-card`, `text-foreground`,
   `border-border`, `bg-primary`, `text-muted-foreground`). Do NOT hardcode hex colors or
   `bg-blue-600`, `text-teal-500`, `bg-${color}-50`, `#6c5ce7`, etc. The only place raw course
   colors may appear is a small course-identity dot/left-border using the course's own `color` value
   as an inline style — never as primary UI chrome.
3. **Dark mode uses the `.dark` class** (next-themes `attribute="class"` + Tailwind `darkMode:"class"`).
   Use Tailwind `dark:` variants. **Never** use `[data-theme='dark']` selectors — they are a bug and
   do nothing. If you see them, convert to `.dark`/`dark:`.
4. **Purge AI-slop** (full blacklist in §8). No emoji, no gradients-as-decoration, no glassmorphism,
   no glow orbs, no `font-black`, no 500ms zoom/fade entrances, no color-soup.
5. **Remove unused imports** you orphan (e.g. removed image imports, removed icons). Don't leave dead code.

---

## 1. Brand & palette

MTU crest → **deep forest green** (primary), **navy** (ink/structure), with **purple** and **gold**
as *sparing* secondary accents only. One brand accent dominates: **green**.

All color comes from CSS variables (HSL triplets) defined in `globals.css`. Use them via Tailwind:

| Purpose | Tailwind class | Notes |
|---|---|---|
| Page background | `bg-background` | cool off-white / dark slate |
| Primary text / ink | `text-foreground` | deep navy-charcoal |
| Secondary / supporting text | `text-muted-foreground` | |
| Card / panel surface | `bg-card` `text-card-foreground` | |
| Hairline borders | `border-border` | borders > shadows |
| Brand action / active | `bg-primary` `text-primary-foreground` | MTU forest green |
| Subtle surface / hover | `bg-secondary` / `bg-muted` / `bg-accent` | neutral, NOT colored |
| Danger | `bg-destructive` `text-destructive-foreground` | desaturated red |
| Focus ring | `ring-ring` | green |

**Named brand accents** (use rarely, for identity/status — not general chrome):
`text-brand-green`, `bg-brand-green-soft`, `text-navy`, `bg-navy-soft`,
`text-gold` (ratings/honors), `bg-gold-soft`, `text-brand-purple`, `bg-brand-purple-soft`.

**Functional status** (tinted, low-chroma): `text-success bg-success/10`, `text-warning bg-warning/10`,
`text-info bg-info/10`, `text-destructive bg-destructive/10`. Use `/10`–`/15` tints for backgrounds.

Saturation discipline: never use a screaming saturated fill for large areas. Soft tints for fills,
full-strength color only for small marks (dots, icons, thin bars, single words).

---

## 2. Typography

Two families, wired via `next/font` as CSS vars:
- **`font-serif`** = Source Serif 4 → page titles, the wordmark, major hero/section display headings.
  Academic, institutional. Use `font-semibold tracking-tight`.
- **`font-sans`** = Public Sans (default body) → everything else: UI, labels, data, paragraphs.

Rules:
- **Max weight is `font-semibold` (600)** for nearly everything. `font-bold` (700) only for a rare
  single emphasis. **Never `font-black`/`font-extrabold`.**
- Page title: `font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground`.
- Section heading: `text-lg font-semibold text-foreground` (sans). Sentence case.
- Small label / eyebrow: `text-xs font-medium text-muted-foreground`. Use uppercase+tracking
  **sparingly** (at most one per view, e.g. a single eyebrow) — not on every label.
- Body: `text-sm leading-relaxed text-muted-foreground`; constrain prose width with `max-w-prose`.
- Numbers / stats / tables: add `tabular-nums`. Stat value: `text-2xl font-semibold tabular-nums`
  (NOT `text-3xl font-black`).
- Headings: **sentence case**, not Title Case. Use `text-balance` on headings, `text-pretty` on body.

---

## 3. Spacing, layout, radius, shadow

- Let it breathe. Page sections: `space-y-6` / `space-y-8`. Card padding: `p-5` or `p-6`.
- Use CSS Grid for multi-column (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5`).
- Constrain very wide content; the dashboard shell already provides horizontal padding.
- **Radius:** containers/cards `rounded-xl` (12px); buttons/inputs/badges `rounded-md` (≈8px via
  `--radius`); status pills & avatars `rounded-full`. Don't put 24px bubble radius on everything.
- **Shadow:** prefer a hairline `border border-border`. Add `shadow-sm` for genuine elevation only.
  Shadows are pre-tinted navy in config — never add custom heavy/colored glow shadows.

---

## 4. Components

- **Card:** `bg-card border border-border rounded-xl` + optional `shadow-sm`. Hover (if interactive):
  `transition-colors hover:border-primary/40` — **not** `hover:scale`, not `hover:shadow-2xl`.
- **Button:** use `@/components/ui/button`. Primary = default variant (green). Secondary actions =
  `variant="outline"` or `variant="ghost"`. No gradient fills, no glow. Active press is built-in feel;
  you may add `active:translate-y-px`. Don't stack two loud buttons — one primary + one quiet.
- **Badge / status:** `@/components/ui/badge`. Status = tinted: `bg-success/10 text-success border-transparent`.
  Keep small. Category tags `rounded-md`; live/state pills `rounded-full`.
- **Inputs:** use `@/components/ui/input` etc. `h-10`/`h-11`, `rounded-md`, focus ring is built in.
- **Live indicator:** a single small dot `h-2 w-2 rounded-full bg-success` with a gentle
  `animate-pulse` (ONE element) and a visible text label "Live". Accessible, not a fireworks show.
- **Empty state:** centered, a calm lucide icon (`strokeWidth={1.5}`, muted), one sentence in
  `text-muted-foreground`, and a single primary action. No dashed rainbow boxes.
- **Loading:** prefer skeletons (`bg-muted animate-pulse rounded-md`) shaped like the content.
  A spinner, if used, is neutral (`text-muted-foreground`), small, no neon.

---

## 5. Motion

- Transitions 150–200ms on `color`/`background`/`border`/`transform`/`opacity` only (GPU-friendly).
- Entrance animation, if any: a single subtle `animate-fade-in` (≤200ms, opacity + 4px translate).
  **Remove** `animate-in fade-in zoom-in-95 duration-500`, staggered emoji frames, decorative pulses.
- Always include `:focus-visible` rings (handled by primitives) and `active` feedback on buttons.

---

## 6. Copy & content

- **Sentence case** for headings and buttons ("My courses", "Sign in", not "Sign In To Portal").
- **No emoji anywhere** (👋 ⚠️ 🤚 ❗ etc.). Replace emoji meaning with a lucide icon or plain text.
- No hype/AI clichés: drop "Launch", "Elevate", "Seamless", "Atmosphere", "Initializing secure
  session…", "Empowered to Excel · Academic Gateway" hero spam. The motto "Empowered to Excel" may
  appear once, quietly, as a tagline.
- Confident, plain microcopy. Errors are direct: "Couldn't sign you in. Check your email and password."
  No "Oops!", no exclamation marks in success messages.
- Keep all real data/labels from the store intact (course codes, names, levels, programs).

---

## 7. Icons

- Keep **lucide-react** (already a dependency — do not swap libraries). Standardize: `size={18}` in
  nav/inline, `size={16}` in dense rows; `strokeWidth` default. Consistent sizing per context.
- Avoid cliché metaphors where trivial, but do not over-engineer. Don't introduce new icon packages.

---

## 8. AI-slop blacklist — remove on sight

- 👋/emoji of any kind, animated emoji frames, the wave-hand keyframes.
- Decorative gradients: `bg-gradient-to-*` used as background wash, `nerdy-bg`, lavender/blue/teal
  fades, the `linear-gradient(135deg,#e6f0fc…)` body background.
- Glassmorphism: `.glass-panel`, `backdrop-blur-xl/2xl` on cards, translucent `bg-white/70`.
- Glow orbs / blobs: `blur-3xl`, floating `rounded-full bg-*/10 animate-pulse` decorations.
- Background photos behind app chrome: the `ADMIN.jpg` / `Gemini_Generated_Image*` imports and the
  `dashboard-wrapper::before` image overlay + `.global-overlay`. Remove the imports too.
- `font-black` / `font-extrabold` / `tracking-tighter` on display text.
- Color-soup: `bg-${stat.color}-50`, per-item rainbow accents as chrome, hardcoded `bg-blue-600`,
  `text-teal-600`, `#6c5ce7`, `bg-slate-900` hero cards with giant watermark icons.
- `animate-in … zoom-in-95 duration-500`, `hover:scale-[1.01]`, neon `shadow-teal-600/20`.
- `[data-theme='dark']` selectors (convert to `.dark`).

---

## 9. Per-file checklist (apply to every page/component)

1. Replace hardcoded colors with semantic tokens (§1).
2. Swap display weights to `font-serif … font-semibold` (titles) / `font-semibold` max (§2).
3. Remove every blacklisted item (§8); delete orphaned imports.
4. Normalize radius (`rounded-xl` containers / `rounded-md` controls) and shadows (border + `shadow-sm`).
5. Convert dark styling to `dark:` / `.dark`.
6. Add/repair hover, focus, empty, and loading states (§4).
7. Rewrite copy to sentence case, no emoji, no hype (§6).
8. Verify NO store/routing/handler/prop/logic changed. Keep `"use client"`.
9. Ensure semantic HTML (`<nav> <main> <section> <aside> <header>`), `alt` text on images.
