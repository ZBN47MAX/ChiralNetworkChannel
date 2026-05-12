# Custom Template Tutorial — English

> Other languages: [中文 (Chinese)](./TUTORIAL.zh.md) · to add a
> new tutorial language, drop `TUTORIAL.<locale>.md` into this
> folder.

## 1. What this folder is for

`CustomTemplate/` ships **starter scaffolds** for adding two
kinds of customization to Chiral Network Channel:

- **A new theme** — a complete visual style (colors, optionally
  decorative animations like scanlines or falling particles).
  Themes live in `public/style/<id>.css`. The bundled set is
  `dark`, `light`, `division`. Adding `sepia`, `midnight`,
  `cyberpunk`, etc. is a copy-paste-tweak job — no JS edits.
- **A new UI language** — translations for every label, button,
  tooltip, error toast in the interface. Locales live in
  `public/language/<id>.json`. The bundled set is `zh`, `en`,
  `zh-TW`. Adding `ja`, `fr`, `ko`, etc. is a single JSON file
  + a one-line HTML registration.

> **Files inside `CustomTemplate/` are NOT loaded by the running
> app.** This folder sits outside `public/` precisely so nothing
> inside is ever served by the static file handler. To actually
> ship a theme or locale, copy the relevant template into the
> matching `public/style/` or `public/language/` folder, fill it
> in, and register it via two or three single-line edits in
> `public/index.html`. Detailed steps below.

## 2. Folder layout

```
CustomTemplate/
├── Tutorial/
│   ├── TUTORIAL.en.md                 ← this file
│   ├── TUTORIAL.zh.md                 ← Chinese version
│   └── (future: ja / fr / ko / ...)
├── style/
│   └── _template.css                  ← starter for a new theme
└── language/
    ├── _template.json                 ← starter for a new locale
    └── _template.json.md              ← per-key field reference
```

### Quick links

| File | Purpose |
|---|---|
| 🎨 [`style/_template.css`](../style/_template.css) | Copy to `public/style/<your-id>.css` to start a new theme. Every CSS variable has inline comments + recommended max length + bundled-theme reference values. |
| 🌐 [`language/_template.json`](../language/_template.json) | Copy to `public/language/<your-id>.json` to start a new locale. All 104 keys listed with empty values; fill in only what you want translated (empty → falls back to Chinese baseline). |
| 📋 [`language/_template.json.md`](../language/_template.json.md) | Per-key field reference: meaning, recommended max length, UI location, and bundled translations as examples. |

To contribute a tutorial in another language, drop
`TUTORIAL.<locale>.md` into `Tutorial/` — the contents of this
file translated in full are a fine starting point.

## 3. Tutorial 1 — Make a custom theme

We'll build a `sepia` theme as the running example. Substitute
your own id everywhere you see `sepia`.

### Step 1. Copy the template

```
CustomTemplate/style/_template.css  →  public/style/sepia.css
```

### Step 2. Edit the new file

Open `public/style/sepia.css`. Two things to do:

**(a) Replace `__YOUR_ID__` placeholders.** The template uses
`__YOUR_ID__` everywhere the theme id appears (selector blocks,
keyframe names). Your editor's "Find & replace in file" turns
this into one operation. Replace `__YOUR_ID__` with `sepia`.

**(b) Set every variable.** The file is one big block of
`--variable: value;` lines, each with comments explaining what
the variable controls, the recommended range, and the values the
bundled themes chose. Pick colors that match your theme's mood
and fill in. The two key variables to start with:

- `--theme-name` — the dropdown label. Whatever you write here is
  what every UI language shows. **Recommended max: 12 chars.**
- `--bg` — the page background, the most visible color of the
  theme.

The full variable list (the `_template.css` enumerates them with
explanations):

```
--theme-name      Display name (string, ≤12 chars)
--bg              Outermost page background
--surface         Standard panel/card background
--surface-2       Lifted panel
--hover           Hover state on rows
--active          Active/selected row
--border          Faint divisions
--border-strong   Emphasis edges
--text            Primary text
--text-dim        Secondary text
--text-faint      Tertiary text
--accent          Brand color (active chip / button / link)
--accent-dim      Darker variant for hover/disabled
--focus           Keyboard focus ring (DIFFERENT from accent)
--danger          Error color
--success         Success color
--scrim-deep      Dialog backdrop (heaviest)
--scrim-mid       Mid translucency
--scrim-light     Subtle haze
--panel-shadow    Composite shadow for lifted panels
```

Every variable has reference values from `dark` / `light` /
`division` in the comments — start by copying one of those and
adjusting the accent.

### Step 3 (optional). Add decorative effects

The bottom of `_template.css` has commented-out scaffolds for:

- A scanline overlay (`body::after`)
- A two-layer parallax particle system (`html::before` +
  `body::before`)
- Component-level overrides (e.g. hexagonal chips)

To enable any of them: uncomment the block and tweak values.
**All decorative effects MUST stay qualified with
`[data-view="home"]`** so they only appear on the main page.
Detail pages, the player, admin, etc. stay distraction-free.

`prefers-reduced-motion: reduce` fallbacks are also in the
template — keep them, they freeze animation for users who set
OS-level reduce-motion.

### Step 4. Register the theme

Three single-line edits in `public/index.html`:

**(a)** Add a `<link>` near the existing theme stylesheets in
`<head>` (look for the comment `Theme palettes — one <link> per
available theme`):

```html
<link rel="stylesheet" href="style/sepia.css?v=__BUILD__">
```

**(b)** Extend the `KNOWN_THEMES` array in the inline first-paint
script (also in `<head>`, just above the link list):

```js
var KNOWN_THEMES = ['dark', 'light', 'division', 'sepia'];
```

**(c)** Add an `<option>` inside `#theme-select` (in the header):

```html
<option value="sepia">Sepia</option>
```

The `<option>` text is a placeholder that's overwritten at boot
by `app.js` reading `--theme-name`, so any readable string works
there.

### Step 5. Verify

Hard reload the page in the browser. The theme dropdown should
now list "Sepia" (or whatever your `--theme-name` says). Pick it;
the page should re-color. Refresh — the theme should persist
(stored in `localStorage`).

That's it. Zero JS edits. Zero `language/*.json` edits. Zero
`style.css` edits (the main stylesheet).

## 4. Tutorial 2 — Make a custom UI language

We'll build a `ja` (Japanese) locale.

### Step 1. Copy the template

```
CustomTemplate/language/_template.json  →  public/language/ja.json
```

### Step 2. Open the field reference

Open `CustomTemplate/language/_template.json.md` next to your new
file. It lists all 104 keys grouped by area (header / menu /
admin / etc.) with:

- **Meaning** — what the string labels.
- **Max** — recommended character count.
- **Where** — the visible UI location.
- **Example zh / en / zh-TW** — bundled translations.

### Step 3. Translate (selectively)

Edit `public/language/ja.json`. Fill in any value you want
translated. **Empty strings are fine** — the UI falls back to
the original Chinese baseline for anything left empty.

You don't have to translate all 104 keys before shipping. A
locale with the 30 most-visible strings (`header.*` + `menu.*` +
`admin.tab.*`) is already useful — admins translate the
long-tail strings (deep error toasts, tooltip details) over time
as needed.

### Step 4. Mind the placeholders

Some values contain `{name}` braces — those are substituted at
runtime. Examples:

- `admin.cat.added` —
  `"已添加 {id}（作为 {where} 的标签，保存后生效）"` becomes
  `"Added foo (under bar, takes effect on Save)"` in English.
  Your translation must keep `{id}` and `{where}` somewhere in
  the string, but the surrounding wording and word order are
  entirely up to you.
- `admin.cat.parentChanged` — `"父标签已改为「{parent}」"`
  → `"親タグを「{parent}」に変更しました"`.

If you remove a placeholder, the runtime value won't appear in
your message and the user will see a confirmation that lacks the
information they need.

### Step 5. Register the locale

One single-line edit in `public/index.html` — add `<option>`
inside `#lang-select`:

```html
<option value="ja">日本語</option>
```

**The label uses the language's endonym** — its name in itself,
not translated. Users looking for their language should be able
to find it regardless of the active UI locale. So Japanese reads
as "日本語" in every locale, French as "Français", Korean as
"한국어".

### Step 6. Verify

Hard reload. The language dropdown should list "日本語". Pick
it; the page text should switch. Untranslated keys remain in
Chinese (your visual checklist of remaining work). Refresh — the
selection persists.

## 5. Choosing what to customize: theme vs locale

| You want to... | Edit |
|---|---|
| ...change colors, surfaces, accent | New theme |
| ...add decorative animation (scanline / particles / glow) | New theme |
| ...change a single component's shape (round → hexagonal chip) | New theme (component override) |
| ...translate the UI to a new language | New locale |
| ...rename a label without changing the language | New locale (override) |
| ...rename a theme to something less generic in your locale | NOT supported by design — theme names are CSS-side, locale-independent. Pick a name that reads well universally, or change `--theme-name`. |

## 6. Field reference index

For exhaustive per-field documentation:

- **Theme variables** → see the inline comments in
  `CustomTemplate/style/_template.css`. Each variable has its
  meaning, recommended range, and bundled-theme reference values.
- **Locale keys** → see
  `CustomTemplate/language/_template.json.md`. All 104 keys
  grouped, with meaning, max length, UI location, and bundled
  translations as reference.

## 7. Deployment / when do changes take effect?

For local development:

- **CSS / HTML / JSON file changes** are pure-frontend. Hard
  reload (`Ctrl+Shift+R`) the browser, no server restart needed.
- The Chiral Network Channel app supports hot rebuild via
  `_=__BUILD__` cache-busting — when you edit a file, the next
  page load fetches the new content (the inline first-paint
  script and the existing service worker handle cache
  invalidation).

For deployment to the actual server (NAS):

- Push your changed files via your usual deploy method (the
  project README or `deploy/` folder explains).
- The server doesn't need to restart for theme/locale changes;
  the server only serves files. Browser hard reload after deploy.

## 8. FAQ

**Q: My new theme is missing icons / certain elements look broken.**
A: Some component-level styles in `style.css` still have
`:root[data-theme="light"] .selector { color: #xxx }` overrides
hard-coded for the bundled light theme. New themes that look
"broken" usually need to add their own parallel override for
those specific selectors, OR (better) wait for the variable-
extraction cleanup pass that promotes those colors to fresh
variables.

**Q: Can I make my theme have different decorative effects on
different views?**
A: Yes — the `data-view` attribute on `<html>` carries the
active view id (`home`, `detail`, `player`, `gallery`, `admin`,
etc.). Most themes restrict effects to `[data-view="home"]` (the
only non-task screen), but you could write
`[data-view="detail"]` for a detail-only effect.

**Q: How do I share my theme/locale with other Chiral Network
Channel users?**
A: Send them the `.css` or `.json` file plus the index.html
edits. They drop it in the same path, register the same way.

**Q: My locale has 30 keys, the others have 104. Will it break?**
A: No. Empty values fall back to the original Chinese baseline.
The 74 missing keys appear in Chinese until you add them.

**Q: Can a theme write to localStorage / fetch external assets?**
A: Themes are pure CSS. If you need that, you'd be writing a
plugin, which is not part of the theme contract. (No plugin
system currently exists; would have to be added.)
