# Language Template — Per-Key Field Reference

This document explains every key in `_template.json`. For each key:

- **Meaning** — what the string labels in the UI.
- **Max** — recommended maximum character count. The key sits in a
  fixed-width slot in the layout; longer strings either truncate
  with ellipsis, wrap to a second line (some controls allow it,
  most don't), or push neighboring controls off-screen on small
  viewports. The numbers below are conservative; you can usually
  exceed by 20-30% without visible damage on a desktop browser
  but a 320px-wide phone is the binding constraint.
- **Where** — the visible location of the string. Open the page,
  switch to your locale-in-progress, and look there to verify your
  translation reads naturally in context.
- **Example zh / en / zh-TW** — the bundled translations for
  reference.

Keys that contain `{placeholder}` curly braces accept runtime
parameters from `t(key, params)`. Keep the braces and the name
inside them verbatim; they're substituted at render time. You may
re-order the surrounding text freely (e.g. English "Added X under
Y" can be Chinese "在 Y 下面新增了 X" — the param order is yours).

If you leave a value as the empty string `""`, the UI falls back
to whatever literal text the HTML / JS originally shipped with
(currently Chinese, the project's source language). Empty
translations don't break anything; you can ship a 30-key locale
and add more later.

---

## `header.*` — top bar (~20 keys, all very short)

| Key | Meaning | Max | Where | Example zh / en / zh-TW |
|---|---|---|---|---|
| `header.back` | "Go back" button text | 6 | Top-left back button when not on the home view | 返回 / Back / 返回 |
| `header.kind.video` | Subsystem switcher tab — video | 6 | Top-bar segment control (4 tabs side by side, tight fit on mobile) | 视频 / Video / 影片 |
| `header.kind.audio` | Subsystem switcher tab — audio | 6 | Same as above | 音频 / Audio / 音訊 |
| `header.kind.image` | Subsystem switcher tab — images | 6 | Same as above | 图片 / Images / 圖片 |
| `header.kind.novel` | Subsystem switcher tab — novels | 6 | Same as above | 小说 / Novels / 小說 |
| `header.kindSwitch.aria` | Accessible label for the whole switcher group | 16 | Screen-reader announcement when user tabs to the switcher | 切换模式 / Switch subsystem / 切換模式 |
| `header.kindSwitch.title` | Mouse-hover tooltip for the switcher | 36 | Tooltip on the wrapping `<div>` | 切换视频/音频/图片/小说 / Switch between video / audio / images / novels / 切換影片/音訊/圖片/小說 |
| `header.userPill.title` | Mouse-hover tooltip for the user pill | 12 | Tooltip on the user-pill button | 设置菜单 / Settings menu / 設定選單 |
| `header.userPill.aria` | Accessible label for the user pill | 12 | Same as title | (same) |
| `header.login` | "Sign in" button when logged out | 6 | Top-bar button replacing the user pill | 登录 / Sign in / 登入 |
| `header.create.title` | Tooltip for the "+" / new collection button | 10 | Tooltip on the icon-only button | 新建合集 / New collection / 新增合集 |
| `header.create.aria` | Accessible label, same as title | 10 | (same) | (same) |
| `header.search.title` | Tooltip for the magnifying-glass button | 10 | Tooltip | 高级搜索 / Advanced search / 進階搜尋 |
| `header.search.aria` | Accessible label, same as title | 10 | (same) | (same) |
| `header.history.title` | Tooltip for the history button | 10 | Tooltip | 播放历史 / Playback history / 播放紀錄 |
| `header.history.aria` | Accessible label, same as title | 10 | (same) | (same) |
| `header.theme.aria` | Accessible label for the theme dropdown | 8 | Screen-reader announcement | 主题 / Theme / 主題 |
| `header.theme.title` | Mouse-hover tooltip for theme dropdown | 8 | Tooltip | 切换主题 / Switch theme / 切換主題 |
| `header.lang.aria` | Accessible label for the language dropdown | 8 | Screen-reader announcement | 语言 / Language / 語言 |
| `header.lang.title` | Mouse-hover tooltip for language dropdown | 8 | Tooltip | 切换语言 / Switch language / 切換語言 |

> **Theme names are NOT here.** A theme called "Sepia" reads as
> "Sepia" in every language. Theme labels are owned by the
> theme's `style/<id>.css` via `--theme-name`.

> **Language names are NOT here either.** Each `<option>` in
> `#lang-select` uses the language's endonym (its name in itself),
> on purpose so users can find their language regardless of the
> active locale.

---

## `menu.*` — settings popover (8 keys)

| Key | Meaning | Max | Where | Example zh / en / zh-TW |
|---|---|---|---|---|
| `menu.history` | "Playback history" menu item | 10 | Settings popover (click user pill) | 播放历史 / Playback history / 播放紀錄 |
| `menu.admin` | "Admin panel" menu item (admin-only) | 10 | Settings popover, admin-gated | 管理面板 / Admin panel / 管理面板 |
| `menu.autoVideoMini` | "Auto mini-window when leaving page (video)" toggle label | 30 | Settings popover with toggle on right | 离开页面自动小窗（视频）/ Auto mini-window when leaving page (video) / 離開頁面自動小窗（影片） |
| `menu.autoAudioMini` | Same, but for audio | 30 | Same | 离开页面自动小窗（音频）/ Auto mini-window when leaving page (audio) / 離開頁面自動小窗（音訊） |
| `menu.audioMiniMode.label` | Prefix for the audio float mode cycler. Followed by ": <current value>" | 12 | Cycle button "音频悬浮模式: 浏览器内" | 音频悬浮模式 / Audio floating mode / 音訊懸浮模式 |
| `menu.subSize.label` | Prefix for the subtitle size cycler | 8 | Cycle button "字幕字号: 中" | 字幕字号 / Subtitle size / 字幕字級 |
| `menu.password` | "Change password" menu item | 8 | Settings popover, logged-in only | 修改密码 / Change password / 修改密碼 |
| `menu.logout` | "Sign out" menu item | 6 | Settings popover, logged-in only | 登出 / Sign out / 登出 |

---

## `admin.tab.*` + `admin.rescanMedia` (6 keys)

| Key | Meaning | Max | Where |
|---|---|---|---|
| `admin.tab.users` | Admin sub-tab | 6 | Top of admin panel |
| `admin.tab.stats` | Admin sub-tab | 6 | Same |
| `admin.tab.health` | Admin sub-tab | 8 | Same |
| `admin.tab.categories` | Admin sub-tab | 8 | Same |
| `admin.tab.duplicates` | Admin sub-tab | 10 | Same |
| `admin.rescanMedia` | Top-right "Rescan media library" button | 12 | Admin panel toolbar |

---

## `admin.health.*` (2 keys)

| Key | Meaning | Max |
|---|---|---|
| `admin.health.rescan` | "Rescan" button on the Health tab | 8 |
| `admin.health.clean` | "Clean orphan data" button | 14 |

---

## `admin.cat.*` — category editor (the biggest cluster, ~70 keys)

The category editor is `admin.cat.*`. Sub-namespaces:

- `admin.cat.section.*` — header for each kind block.
- `admin.cat.layerRow.*` — chip-row "+" buttons.
- `admin.cat.editPanel.*` — inline edit panel fields & buttons.
- `admin.cat.dialog.*` — quick "add child tag" modal dialog.
- (root `admin.cat.*`) — toolbar + status messages.

### Toolbar / shell

| Key | Meaning | Max |
|---|---|---|
| `admin.cat.exportConfig` | "Export config" button | 10 |
| `admin.cat.exportConfigTitle` | Tooltip for the same | 30 |
| `admin.cat.importConfig` | "Import config" button | 10 |
| `admin.cat.importConfigTitle` | Tooltip for the same | 60 |
| `admin.cat.section.video` | Section header above the video block | 14 |
| `admin.cat.section.audio` | Section header — audio | 14 |
| `admin.cat.section.image` | Section header — image | 14 |
| `admin.cat.section.novel` | Section header — novel | 14 |
| `admin.cat.sortBtnTitle` | Tooltip for the "A→Z" sort button | 30 |
| `admin.cat.editEmptyHint` | Helper text shown when no chip is being edited | 60 |
| `admin.cat.saveBtn` | "Save categories" primary button | 10 |
| `admin.cat.resetBtn` | "Reload" secondary button | 8 |

### Chip rows ("+" buttons at row end)

| Key | Meaning | Max |
|---|---|---|
| `admin.cat.layerRow.addTopLabel` | Layer-1 row-end button text | 12 |
| `admin.cat.layerRow.addChildLabel` | Layer-N row-end button text | 12 |
| `admin.cat.layerRow.addTopTitle` | Tooltip for the layer-1 button | 14 |
| `admin.cat.layerRow.addChildTitle` | Tooltip for layer-N (has `{parent}` placeholder) | 24 |
| `admin.cat.layerRow.addChildTitleNoParent` | Tooltip when no parent in selection | 14 |

### Search

| Key | Meaning | Max |
|---|---|---|
| `admin.cat.searchPlaceholder` | Filter input placeholder | 30 |
| `admin.cat.searchEmpty` | Shown when no tags match the search query | 60 |

### Edit panel

| Key | Meaning | Max |
|---|---|---|
| `admin.cat.editPanel.titlePrefix` | Prefix shown before the path label, e.g. "Editing: 日漫 / 萝莉" | 6 |
| `admin.cat.editPanel.idTitle` | Tooltip on the read-only id span | 12 |
| `admin.cat.editPanel.closeBtn` | "Close" / exit-editing button | 8 |
| `admin.cat.editPanel.closeBtnTitle` | Tooltip for it | 12 |
| `admin.cat.editPanel.labelField` | "Label" field name | 8 |
| `admin.cat.editPanel.hiddenField` | "Hidden (...)" checkbox label | 30 |
| `admin.cat.editPanel.parentField` | "Parent tag" field name | 8 |
| `admin.cat.editPanel.promoteTopBtn` | "Promote" button text | 8 |
| `admin.cat.editPanel.promoteTopTitle` | Tooltip | 24 |
| `admin.cat.editPanel.addChildBtn` | "+ Child" button | 6 |
| `admin.cat.editPanel.addChildTitle` | Tooltip | 14 |
| `admin.cat.editPanel.deleteBtn` | "Delete" button | 6 |
| `admin.cat.editPanel.deleteTitleEnable` | Tooltip when delete is enabled | 24 |
| `admin.cat.editPanel.deleteTitleDisable` | Tooltip when delete is disabled (has children) | 24 |
| `admin.cat.editPanel.kwLabel` | Header above the keyword chip cluster | 60 |
| `admin.cat.editPanel.kwInputPh` | Keyword input placeholder | 10 |

### Status messages (status bar at the bottom of the categories tab)

These often contain `{placeholder}` curly-brace substitutions —
see top of this document for rules.

| Key | Meaning | Max | Placeholders |
|---|---|---|---|
| `admin.cat.deleteHasKidsErr` | Error toast when deleting a non-leaf | 24 | `{id}` |
| `admin.cat.deleted` | Confirmation: tag marked for delete | 24 | `{id}` |
| `admin.cat.parentChanged` | Confirmation: parent reassigned | 24 | `{parent}` |
| `admin.cat.promotedTop` | Confirmation: promoted to top level | 22 | `{id}` |
| `admin.cat.hiddenChanged` | Confirmation: hidden state toggled | 22 | `{id}` |
| `admin.cat.kwUpdated` | Confirmation: keyword chip CRUD | 16 | none |
| `admin.cat.sorted` | Confirmation: sort applied | 14 | none |
| `admin.cat.added` | Confirmation: new tag added | 30 | `{id}`, `{where}` |
| `admin.cat.added.where.top` | The fallback for `{where}` when parent is null | 4 | none |
| `admin.cat.saved` | Confirmation after PUT | 6 | none |
| `admin.cat.savedToast` | Toast popping up alongside the status message | 8 | none |
| `admin.cat.saving` | "Saving..." while PUT is in flight | 8 | none |
| `admin.cat.saveFailed` | Server returned an error | 30 | `{msg}` |

### Add-child dialog

| Key | Meaning | Max | Placeholders |
|---|---|---|---|
| `admin.cat.dialog.title` | Modal heading | 14 | none |
| `admin.cat.dialog.subtitle` | Sub-heading line | 30 | `{parent}`, `{kind}` |
| `admin.cat.dialog.parentTop` | The `{parent}` substitution when creating a top-level tag | 6 | none |
| `admin.cat.dialog.idLabel` | "id" field label | 28 | none |
| `admin.cat.dialog.labelLabel` | "Label" field label | 18 | none |
| `admin.cat.dialog.cancelBtn` | Cancel button | 6 | none |
| `admin.cat.dialog.okBtn` | Submit button | 6 | none |
| `admin.cat.dialog.errEmpty` | Validation: empty fields | 18 | none |
| `admin.cat.dialog.errIdBadChar` | Validation: id contains illegal chars | 22 | none |
| `admin.cat.dialog.errTooLong` | Validation: 40-char limit | 12 | none |
| `admin.cat.dialog.errIdExists` | Validation: duplicate id | 8 | none |
| `admin.cat.dialog.errBadKind` | Validation: unknown subsystem | 14 | `{kind}` |
| `admin.cat.dialog.errDepth` | Validation: max depth exceeded | 8 | none |

---

## `admin.dup.*` — duplicate-check tab (7 keys)

| Key | Meaning | Max |
|---|---|---|
| `admin.dup.suspectMode` | Radio label for suspect detection mode | 36 |
| `admin.dup.similarityMode` | Radio label for similarity detection | 10 |
| `admin.dup.thresholdLabel` | Slider label | 10 |
| `admin.dup.refresh` | "Refresh" button | 6 |
| `admin.dup.markBtn` | "Mark as non-duplicate" button | 18 |
| `admin.dup.markBtnTitle` | Tooltip | 30 |
| `admin.dup.viewWhitelist` | "View whitelist" button | 12 |

---

## Tips

1. **Run a side-by-side check.** Open the page, set
   `<select id="lang-select">` to your locale-in-progress, and
   click through the views. Every untranslated string will show
   up as the literal Chinese text that ships in the HTML — that's
   your visual punchlist of remaining work.

2. **Don't overshoot Max.** When in doubt, prefer abbreviation to
   wrapping. The header in particular is single-line and will
   crop unattractively if a translation pushes the limits.

3. **Placeholders aren't optional.** A `{id}` or `{parent}` token
   in the bundled translation is mandatory because the value is
   spliced in at runtime. Removing the brace substitution leaves
   the runtime data unrepresented in your message — bug city.

4. **Punctuation can stay or go.** Chinese strings use 「」（）as
   delimiters; English idiomatic quotes are `""` or `'...'`. Use
   what's natural to your locale; the framework doesn't care.

5. **Half a translation is fine.** The system falls back to the
   original Chinese for any empty value, so you can ship 30 keys
   today and 70 next week without a broken UI in between.
