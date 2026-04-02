# JSON / XML Formatter

一个面向程序员日常使用的轻量桌面工具，用来快速处理 `JSON` 和 `XML` 字符串的格式化、压缩、复制、回填与编辑。

项目基于 `Tauri + React + TypeScript + Tailwind CSS` 构建，目标是提供一个真正可用的桌面应用，而不是临时的网页格式化 Demo。

## 项目特点

- 支持 `JSON` 格式化
- 支持 `JSON` 压缩
- 支持 `XML` 格式化
- 支持 `XML` 压缩
- 支持 `JSON / XML` 模式切换
- 支持自动识别输入内容类型
- 支持从系统剪贴板导入
- 支持复制结果到系统剪贴板
- 支持将结果回填到输入区
- 支持文件导入与文件导出
- 支持拖拽文件导入
- 支持快捷键操作
- 支持历史记录恢复
- 支持窗口置顶
- 支持浅色 / 深色主题切换
- 支持输入区与输出区联动滚动
- 支持桌面环境原生文件选择与保存对话框

## 技术栈

- Tauri
- React
- TypeScript
- Tailwind CSS
- CodeMirror
- fast-xml-parser
- xml-formatter

## 适用场景

- 格式化接口返回的 `JSON`
- 快速查看和整理 `XML` 片段
- 压缩文本后复制到日志、文档或配置项中
- 在桌面环境下快速处理临时字符串，而不依赖在线工具

## 快捷键

- `Ctrl + Enter`：执行格式化
- `Ctrl + Shift + C`：执行压缩
- `Ctrl + L`：清空输入与输出
- `Ctrl + Shift + V`：从剪贴板导入

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动前端预览

```bash
npm run dev
```

默认访问地址：

- [http://127.0.0.1:1420](http://127.0.0.1:1420)

### 3. 启动 Tauri 桌面开发模式

```bash
npm run tauri:dev
```

## 构建与发布

### 构建前端资源

```bash
npm run build
```

### 构建桌面应用

```bash
npm run tauri:build
```

### 运行标准校验流程

```bash
npm run verify
```

### 仅构建免安装可执行文件

```bash
npx tauri build --no-bundle
```

### 运行标准化便携版发布流程

```bash
npm run release:portable
```

执行完成后，会在 `release/` 目录下生成标准化便携版产物。

## 运行环境

推荐环境：

- Node.js 20+
- Rust stable
- Windows 下安装 Microsoft C++ Build Tools

Rust 安装地址：

- [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)

## 项目结构

```text
format-tools/
  src/
    components/
    hooks/
    types/
    utils/
    App.tsx
    main.tsx
    index.css
  src-tauri/
    capabilities/
    icons/
    src/
    Cargo.toml
    tauri.conf.json
  assets/
  public/
  scripts/
  package.json
  README.md
```

## 主要模块说明

- `src/components`
  界面组件与页面结构
- `src/hooks`
  剪贴板、文件传输、主题、窗口控制、格式化状态等逻辑
- `src/utils`
  JSON / XML 处理、错误信息整理、文本统计、编辑器辅助能力等工具函数
- `src-tauri`
  桌面壳层、权限配置、图标资源与原生插件接入
- `scripts`
  清理、编码检查、标准化发布等工程脚本

## 当前版本说明

当前版本重点覆盖的是程序员高频使用的桌面格式化场景：

- 默认带示例内容，打开即可操作
- 输入区与输出区都可直接编辑
- 输出结果可复制、继续修改、再回填处理
- 错误会以可读方式显示在界面中，而不是直接抛技术堆栈
- 在桌面版中，文件导入 / 导出、剪贴板访问、窗口置顶都走原生能力

## 仓库级工程护栏

为了减少编码问题和发布漂移，仓库里补了这些保护：

- `.editorconfig`
  统一 UTF-8、换行与缩进风格
- `.gitattributes`
  规范文本文件与二进制文件行为
- `npm run check:encoding`
  检查 BOM、替换字符和常见乱码痕迹
- `npm run release:portable`
  统一清理、校验、构建和便携版产物输出流程

## 后续可扩展方向

- 多标签页处理
- 更强的结构树视图
- 历史记录搜索
- 更多主题风格
- 更多导入导出格式
- 自动更新与版本发布流程

## License

当前仓库还没有附带正式开源协议。

如果准备公开分发或对外开源，建议补充明确的 `LICENSE` 文件。
