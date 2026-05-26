<div align="center">

<img src="icon/links-icon-9892.png" alt="Chiral Network Channel" width="120">

# Chiral Network Channel

**自托管私人媒体库 · Self-hosted Personal Media Library**

[![Version](https://img.shields.io/badge/version-1.11.0-blue.svg)](version.json)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Synology%20DS124-lightgrey.svg)]()
[![License](https://img.shields.io/badge/license-AS--IS-orange.svg)](#license--许可)

[中文](#中文) · [English](#english) · [完整文档 / Full docs](README/)

</div>

---

## 中文

一套自托管的私人媒体库,运行在 **Synology DS124 NAS** 或 **Windows 电脑**上,让局域网内任何设备(手机 / 平板 / 电视盒子的浏览器)都能浏览和播放你存的视频、音频、图片、小说。

### ✨ 主要功能

- 🎬 **视频** — H.264 / H.265 / VP9 / AV1 / mkv 多音轨,服务端 fmp4 实时直流 + HLS 兼容回退(只在浏览器不支持时启用),内挂 / 外挂字幕(srt / ass / sup)
- 🎵 **音频 HiFi** — FLAC / ALAC / APE / WavPack / DSD 等无损源全适配(v1.11.0+),浏览器解不动的格式自动 fmp4-FLAC remux 保真传输,UI 显示比特率 / 采样率 / 位深 / 声道(「FLAC 24bit/96kHz · 5.1ch · 无损」),5.1/7.1 默认保留原通道,专辑封面、嵌入式歌词、播放进度同步
- 🖼️ **图片** — 漫画 / 画册式翻页阅读
- 📖 **小说** — txt / epub / pdf 阅读器
- 👥 **多用户** — 角色权限、按分类的可见性控制
- 🏷️ **多维度标签** — 分类树 + facet 标签 + 关键字搜索
- 🔐 **登录系统** — Session Cookie,登录限速,IP 白名单

### 📦 我是普通用户,只想用

→ **去 [Releases](https://github.com/ZBN47MAX/ChiralNetworkChannel/releases) 页面下载最新 `ChiralNetworkChannel-Setup-Release*.exe`,双击安装即可。**

安装包内置 Node.js + ffmpeg + 所有依赖,装完直接跑,**不需要自己装任何东西**。

### 🛠️ 我是开发者,想从源码起步

```bash
# 1. clone
git clone https://github.com/ZBN47MAX/ChiralNetworkChannel.git
cd ChiralNetworkChannel

# 2. 装 Node.js 18+(去 https://nodejs.org)
# 3. 装依赖
npm install

# 4. 装 ffmpeg(系统 PATH 里有 ffmpeg / ffprobe 即可)
#    或者放回 bin/ffmpeg/win-x64/ 和 bin/ffmpeg/linux-arm64/
#    https://www.gyan.dev/ffmpeg/builds/  (Windows)
#    https://johnvansickle.com/ffmpeg/    (Linux ARM)

# 5. 建运行时目录
mkdir -p Resource/{media,audio,image,novel} data

# 6. 跑(Windows)
ChiralNetworkChannel.bat

# 6. 跑(Linux / NAS)
bash deploy/start.sh
```

默认监听 `http://0.0.0.0:8080`。第一次启动会自动创建 `admin / admin` 账号,**首次登录后立刻改密码**。

### 📚 详细文档

- **[完整使用说明(中文)](README/README.zh.md)** — 安全风险、部署、所有功能详解
- **[Full Documentation (English)](README/README.en.md)** — Security caveats, deployment, full feature reference

### ⚠️ 安全须知(必读)

**本系统仅供受信任的私有局域网使用,绝对不要暴露到公网。** 项目设计上有意做了多个不适合公网的取舍:

- 🔴 用户密码以**明文**存在 `data/users.json`
- 🔴 服务跑在纯 HTTP,无 HTTPS
- 🔴 Session 30 天有效,登录限速重启即重置
- 🔴 文件上传仅按扩展名过滤,无内容校验

详见 [完整文档的"使用前必读"章节](README/README.zh.md#%EF%B8%8F-使用前必读--安全风险与适用范围)。

### 📜 作者免责声明

我自己做着玩的。**部署不出来、跑不起来、卡住,自己想办法解决** — 不接 issue / 邮件 / 私信问"为什么我装不上"。本项目以 **AS-IS** 提供,部署即代表你接受所有后果自负。

---

## English

A self-hosted private media library that runs on a **Synology DS124 NAS** or a **Windows PC**. Any device on your local network (phone, tablet, TV-box browser) can browse and play videos / audio / images / novels you have stored.

### ✨ Features

- 🎬 **Video** — H.264 / H.265 / VP9 / AV1 / multi-audio mkv, server-side fmp4 live-stream + HLS compatibility fallback (only when the browser can't play it natively), embedded / sidecar subtitles (srt / ass / sup)
- 🎵 **HiFi Audio** — Full lossless coverage for FLAC / ALAC / APE / WavPack / DSD (v1.11.0+); formats the browser can't decode are losslessly remuxed to fmp4-FLAC on the fly; UI shows codec / bitrate / sample rate / bit depth / channels ("FLAC 24bit/96kHz · 5.1ch · Lossless"); 5.1 / 7.1 channels preserved by default; cover art, embedded lyrics, cross-device progress sync
- 🖼️ **Images** — Comic / album-style page-flip reader
- 📖 **Novels** — txt / epub / pdf reader
- 👥 **Multi-user** — Role-based permissions, per-category visibility
- 🏷️ **Faceted tagging** — Category tree + facet tags + keyword search
- 🔐 **Auth** — Session cookies, login rate-limiting, IP whitelisting

### 📦 I'm an end user, just want to use it

→ **Grab the latest `ChiralNetworkChannel-Setup-Release*.exe` from the [Releases](https://github.com/ZBN47MAX/ChiralNetworkChannel/releases) page and double-click to install.**

The installer bundles Node.js + ffmpeg + all dependencies. **You don't need to install anything else.**

### 🛠️ I'm a developer, want to build from source

```bash
# 1. clone
git clone https://github.com/ZBN47MAX/ChiralNetworkChannel.git
cd ChiralNetworkChannel

# 2. Install Node.js 18+ (https://nodejs.org)
# 3. Install dependencies
npm install

# 4. Install ffmpeg (ffmpeg / ffprobe on PATH)
#    Or drop them into bin/ffmpeg/win-x64/ and bin/ffmpeg/linux-arm64/

# 5. Create runtime directories
mkdir -p Resource/{media,audio,image,novel} data

# 6. Run (Windows)
ChiralNetworkChannel.bat

# 6. Run (Linux / NAS)
bash deploy/start.sh
```

Default listens on `http://0.0.0.0:8080`. First start auto-creates an `admin / admin` account — **change the password immediately after first login**.

### 📚 Full Documentation

- **[完整使用说明 (中文)](README/README.zh.md)** — Security risks, deployment, every feature explained
- **[Full Documentation (English)](README/README.en.md)** — Security caveats, deployment, full feature reference

### ⚠️ Security Notice (must read)

**This system is intended for trusted private LANs only — never expose it to the public internet.** Several design choices intentionally make it unsuitable for public exposure:

- 🔴 User passwords stored as **plaintext** in `data/users.json`
- 🔴 Serves over plain HTTP, no HTTPS
- 🔴 Sessions valid for 30 days; login rate-limit resets on restart
- 🔴 File uploads filtered by extension only, no content validation

See the ["Must read before deployment" section](README/README.en.md#%EF%B8%8F-must-read-before-deployment--security-risks--scope-of-use) in the full docs.

### 📜 Author's Disclaimer

I made this for myself, just for fun. **If you can't deploy it, can't get it running, or get stuck somewhere, figure it out yourself** — I won't take issues / emails / DMs asking "why won't it install". Provided **AS-IS**; deploying it means you accept all consequences.

---

## License / 许可

**AS-IS / 按现状提供** — no warranty, no support, use at your own risk.

任何能在 GitHub 上克隆到这份代码的人,都可以自由地阅读、修改、自用。不得二次售卖、不得对外提供商业服务。

