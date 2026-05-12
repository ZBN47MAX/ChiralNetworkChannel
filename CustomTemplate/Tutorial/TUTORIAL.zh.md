# 自定义模板教程 — 中文

> 其他语言：[English](./TUTORIAL.en.md) · 想加新语言版教程？把
> `TUTORIAL.<locale>.md` 文件丢到本文件夹即可。

## 1. 这个文件夹是干什么的

`CustomTemplate/` 提供两类自定义的**起步脚手架**：

- **新主题** — 一套完整视觉风格（颜色、可选的装饰动画如扫描线 /
  飘落粒子）。主题文件在 `public/style/<id>.css`。已带 `dark` /
  `light` / `division` 三个；加 `sepia` / `midnight` /
  `cyberpunk` 之类是「复制-修改-注册」三步，无需改 JS。
- **新 UI 语言** — 界面所有标签、按钮、tooltip、错误信息的翻译。
  文件在 `public/language/<id>.json`。已带 `zh` / `en` / `zh-TW`；
  加 `ja` / `fr` / `ko` 之类只需一个 JSON 文件 + index.html 加
  一行注册。

> **`CustomTemplate/` 文件夹里的文件不会被运行中的 app 加载。**
> 它在 `public/` 之外正是为了避免被静态文件 handler 意外服务出去；
> 这里的文件是供你**复制走**的文档和脚手架。要实际让主题/locale
> 生效，把对应模板复制到 `public/style/` 或 `public/language/`，
> 填好内容，然后在 `public/index.html` 改两到三处单行注册即可。
> 详细步骤见下文。

## 2. 文件夹结构

```
CustomTemplate/
├── Tutorial/
│   ├── TUTORIAL.en.md                 ← 英文版
│   ├── TUTORIAL.zh.md                 ← 本文件
│   └── (将来：ja / fr / ko / ...)
├── style/
│   └── _template.css                  ← 新主题脚手架
└── language/
    ├── _template.json                 ← 新 locale 脚手架
    └── _template.json.md              ← 逐 key 字段参考
```

### 快速入口

| 文件 | 作用 |
|---|---|
| 🎨 [`style/_template.css`](../style/_template.css) | 复制到 `public/style/<你的id>.css` 开始做新主题。每个 CSS 变量都有内联注释 + 推荐最大长度 + bundled 主题参考值。 |
| 🌐 [`language/_template.json`](../language/_template.json) | 复制到 `public/language/<你的id>.json` 开始做新 locale。全部 104 个 key 列出值留空；只填你想翻译的（空值 → 自动回退到中文 baseline）。 |
| 📋 [`language/_template.json.md`](../language/_template.json.md) | 逐 key 字段参考：含义、推荐最大长度、UI 位置、bundled 翻译参考。 |

想贡献其他语言版的教程？把 `TUTORIAL.<locale>.md` 丢到
`Tutorial/` — 把本文件全文翻译过去就是合适的起点。

## 3. 教程一 — 做一个自定义主题

下面以 `sepia`（棕褐）主题为例。把你的实际 id 替换我下面写的
`sepia`。

### 步骤 1 — 复制模板

```
CustomTemplate/style/_template.css  →  public/style/sepia.css
```

### 步骤 2 — 编辑新文件

打开 `public/style/sepia.css`，两件事：

**(a) 替换 `__YOUR_ID__` 占位符。** 模板里所有需要主题 id 的位置
（选择器、keyframe 名）都用 `__YOUR_ID__` 占位。用你编辑器的
「在文件中查找替换」一次性把 `__YOUR_ID__` 替换为 `sepia`。

**(b) 设置每个变量。** 文件里是一大段 `--变量: 值;` 行，每个
变量都有注释解释作用、推荐范围、bundled 主题选用值。挑符合你
主题氛围的颜色填上去。最关键的两个变量：

- `--theme-name` — 下拉菜单显示名。**这是所有 UI 语言下都看到
  的那个字符串**。**推荐最长 12 字符**。
- `--bg` — 整页背景，主题最显眼的颜色。

完整变量清单（`_template.css` 里逐个有解释）：

```
--theme-name      显示名（字符串，≤12 字符）
--bg              页面最外层背景
--surface         标准面板 / 卡片 / 对话框背景
--surface-2       「升起」面板（子面板 / 悬停卡片）
--hover           行 hover 态
--active          行激活/选中态
--border          浅色分割线
--border-strong   强调边
--text            主文字
--text-dim        次级文字
--text-faint      三级 / 禁用文字
--accent          品牌色（active chip / 按钮 / 链接）
--accent-dim      hover / disabled 用的暗变体
--focus           键盘焦点环（必须**不同于** accent）
--danger          错误色
--success         成功色
--scrim-deep      对话框遮罩（最重）
--scrim-mid       中等不透明
--scrim-light     淡淡遮罩
--panel-shadow    升起面板的复合阴影
```

每个变量都在注释里给了 `dark` / `light` / `division` 的参考值，
建议从已有主题挑一个最接近你目标的，复制一份再调 accent。

### 步骤 3（可选）— 加装饰特效

`_template.css` 末尾有注释掉的几个特效模板：

- 扫描线 overlay（`body::after`）
- 双层视差粒子系统（`html::before` + `body::before`）
- 组件级 override（如六边形 chip）

要启用：去掉那段的注释 + 调参数。**所有装饰特效必须保留
`[data-view="home"]` qualifier**，它们才只在主页出现，不打扰
详情页 / 播放器 / admin 等任务态屏。

`prefers-reduced-motion: reduce` 的兜底也在模板里 — 别删，它让
设了 OS 层「减少动画」的用户看到主题视觉但不被动画干扰。

### 步骤 4 — 注册主题

`public/index.html` 里改三处单行：

**(a)** 在已有主题 stylesheet 旁加一个 `<link>`（找注释
`Theme palettes — one <link> per available theme`）：

```html
<link rel="stylesheet" href="style/sepia.css?v=__BUILD__">
```

**(b)** 扩展 `KNOWN_THEMES` 数组（就在 link 列表上方的内联首屏
script 里）：

```js
var KNOWN_THEMES = ['dark', 'light', 'division', 'sepia'];
```

**(c)** 在 `#theme-select` 里加一个 `<option>`（在 header 区）：

```html
<option value="sepia">Sepia</option>
```

`<option>` 文字只是占位符 — 启动时 `app.js` 会读 `--theme-name`
并覆写它，写啥都行。

### 步骤 5 — 验证

浏览器 hard reload。主题下拉应该出现 "Sepia"（或你写的
`--theme-name`）。选它，页面应该重新着色。刷新 — 选择应该保留
（存在 localStorage）。

完事。零 JS 改动，零 `language/*.json` 改动，零 `style.css`
改动。

## 4. 教程二 — 做一个自定义 UI 语言

下面以 `ja`（日语）为例。

### 步骤 1 — 复制模板

```
CustomTemplate/language/_template.json  →  public/language/ja.json
```

### 步骤 2 — 打开字段参考

打开 `CustomTemplate/language/_template.json.md` 跟新文件并排
看。它列出全部 104 个 key（按 header / menu / admin 等分组）：

- **含义** — 这个字符串在 UI 里标的是什么。
- **最大长度** — 推荐字符数限制。
- **位置** — 可见 UI 位置。
- **zh / en / zh-TW 示例** — 已带的参考翻译。

### 步骤 3 — 选择性翻译

编辑 `public/language/ja.json`。填你想翻译的值。**留空字符串
也行** — 任何留空的 key，UI 会回退到原始中文 baseline。

不需要在发布前翻完所有 104 个 key。一个翻好 30 个最显眼字符串
（`header.*` + `menu.*` + `admin.tab.*`）的 locale 已经能用 —
长尾（深层错误信息、tooltip 细节）可以以后慢慢补。

### 步骤 4 — 注意占位符

部分值含 `{name}` 大括号 — 它们运行时会被实际值替换。例子：

- `admin.cat.added` —
  `"已添加 {id}（作为 {where} 的标签，保存后生效）"` 在英文里
  变成 `"Added foo (under bar, takes effect on Save)"`。你的
  翻译必须保留 `{id}` 和 `{where}` 在某处，但**周围的措辞和
  语序你自己决定**。
- `admin.cat.parentChanged` — `"父标签已改为「{parent}」"` →
  日文：`"親タグを「{parent}」に変更しました"`。

如果你**删掉**了占位符，运行时数据就不会出现在你的消息里，
用户看到的确认信息会缺失关键信息。

### 步骤 5 — 注册 locale

`public/index.html` 里改一处单行 — 在 `#lang-select` 加一个
`<option>`：

```html
<option value="ja">日本語</option>
```

**标签用语言的「endonym」（本族名）** — 即语言用自己写自己的
名字，不翻译。这样无论 UI 当前用什么语言，找日语的用户都能
认出 "日本語"。所以日语永远写 "日本語"，法语写 "Français"，
韩语写 "한국어"。

### 步骤 6 — 验证

Hard reload。语言下拉应该出现 "日本語"。选它，页面文字应该
切。没翻的 key 仍是中文（这是你视觉上的「待翻译清单」）。
刷新 — 选择保留。

## 5. 选择：主题 vs 语言

| 你想要... | 改 |
|---|---|
| ...换颜色、面板、强调色 | 新主题 |
| ...加装饰动画（扫描线 / 粒子 / 微光） | 新主题 |
| ...改单个组件的形状（圆 → 六边形 chip） | 新主题（组件级 override） |
| ...翻译 UI 到新语言 | 新 locale |
| ...在某语言里改一个 label 的措辞 | 新 locale 的 override 该 key |
| ...在某语言里给主题用更合适的名字 | **不支持，按设计** — 主题名在 CSS 端，与 locale 无关。挑一个普适的名字，或改 `--theme-name`。 |

## 6. 字段参考索引

详尽逐字段文档：

- **主题变量** → 看 `CustomTemplate/style/_template.css` 的内联
  注释。每个变量都有含义、推荐范围、bundled 主题参考值。
- **Locale key** → 看 `CustomTemplate/language/_template.json.md`。
  全部 104 个 key 分组列出，含含义、最大长度、UI 位置、bundled
  翻译参考。

## 7. 部署 / 改动什么时候生效？

本地开发：

- **CSS / HTML / JSON 文件改动**是纯前端。浏览器 hard reload
  （`Ctrl+Shift+R`）即可，**不需要重启 server**。
- 项目通过 `_=__BUILD__` cache-busting 支持热更 — 你改完文件，
  下次页面加载就 fetch 新内容（首屏内联 script 和 service
  worker 会处理缓存失效）。

部署到正式服务器（NAS）：

- 用项目惯用的部署方法把改动文件推上去（项目 README 或
  `deploy/` 文件夹有说明）。
- 主题 / locale 的改动**不需要 server 重启**；server 只提供
  文件。部署后浏览器 hard reload 即可。

## 8. 常见问题

**Q：我的新主题某些图标 / 元素看起来坏了。**
A：`style.css` 主体里仍有一些 `:root[data-theme="light"]
.selector { color: #xxx }` 这种为 bundled light 主题硬编码的
override 没抽出来。新主题如果在那些点上看着不对，要么补一份
自己的并行 override，要么（更好）等做完那一波「把硬编码颜色
抽为新变量」的清理 pass。

**Q：能让我的主题在不同 view 上有不同特效吗？**
A：能 — `<html>` 元素的 `data-view` 属性带着当前 view 的 id
（`home` / `detail` / `player` / `gallery` / `admin` 等）。
大多主题把特效限制到 `[data-view="home"]`（唯一非任务态屏），
但你完全可以写 `[data-view="detail"]` 之类做详情页专属特效。

**Q：怎么把我的主题/语言分享给其他 Chiral Network Channel
用户？**
A：发 `.css` 或 `.json` 文件 + 给他们 index.html 改动指令。
他们丢到同样路径，按同样方式注册。

**Q：我的 locale 只有 30 个 key，其它有 104 个，会不会出问题？**
A：不会。空值会回退到原始中文 baseline。74 个缺译会显示中文，
直到你慢慢补译。

**Q：主题能写 localStorage / fetch 外部资源吗？**
A：主题是纯 CSS。如果你要这些，你做的就是 plugin，不在主题
契约范围内。（项目目前**没有** plugin 系统；要加得另开。）
