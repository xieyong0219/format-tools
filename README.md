# JSON / XML Formatter

一个面向程序员的轻量桌面工具，使用 `Tauri + React + TypeScript + Tailwind CSS` 构建，专注处理 JSON / XML 字符串的格式化、压缩、复制和回填操作。软件打开即可使用，不需要登录，不需要联网。

## 技术栈

- Tauri
- React
- TypeScript
- Tailwind CSS
- fast-xml-parser
- xml-formatter

## 安装步骤

### 1. 安装 Node.js

建议使用 Node.js 20 及以上版本。

### 2. 安装 Rust 工具链

Tauri 在 Windows 下需要 Rust 和 Microsoft C++ Build Tools。

- 安装 Rust: [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
- 安装 Visual Studio C++ Build Tools

### 3. 安装项目依赖

```bash
npm install
```

## 开发启动命令

启动前端开发环境：

```bash
npm run dev
```

启动 Tauri 桌面开发模式：

```bash
npm run tauri:dev
```

## 打包命令

构建前端资源：

```bash
npm run build
```

打包桌面应用：

```bash
npm run tauri:build
```

## 目录结构说明

```text
project-root/
  src/
    components/
      Toolbar.tsx
      EditorPanel.tsx
      StatusBar.tsx
      ActionButton.tsx
    hooks/
      useFormatter.ts
      useHotkeys.ts
      useClipboard.ts
      useWindowControls.ts
    utils/
      formatJson.ts
      formatXml.ts
      textStats.ts
      errorMessage.ts
    types/
      index.ts
    App.tsx
    main.tsx
    index.css
  src-tauri/
    capabilities/
      default.json
    src/
      lib.rs
      main.rs
    Cargo.toml
    tauri.conf.json
  package.json
  README.md
```

## 功能说明

### 已实现

- JSON 格式化
- JSON 压缩
- XML 格式化
- XML 压缩
- JSON / XML 模式切换
- 一键复制输出结果
- 输出结果回填到输入区
- 同时清空输入和输出
- 系统剪贴板导入
- 系统剪贴板复制
- 快捷键支持
- 输出区只读
- 错误提示与状态栏摘要
- 默认示例 JSON
- 记住窗口大小与位置

### 快捷键

- `Ctrl + Enter`：执行格式化
- `Ctrl + Shift + C`：执行压缩
- `Ctrl + L`：清空
- `Ctrl + Shift + V`：从剪贴板导入

## 后续可扩展建议

- 文件导入（`.json` / `.xml` / `.txt`）
- 文件导出
- 拖拽文件导入
- 深色模式切换
- 历史记录
- 自动识别输入内容类型
- 多标签页处理

## 说明

- 窗口标题默认是 `JSON / XML Formatter`
- 主界面标题默认是 `JSON / XML 格式化工具`
- 输入区默认带示例 JSON
- 输出区默认为空
- 成功后状态栏显示 `处理成功`
- 失败后状态栏显示具体错误信息
