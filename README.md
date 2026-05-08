# ClipBoard Manager - 粘贴板管理工具

跨平台的桌面粘贴板管理工具，支持文本和图片的历史记录管理。

## 功能特性

- 📋 **自动监听** - 自动记录系统粘贴板内容
- 📝 **文本支持** - 支持纯文本和代码片段
- 🖼️ **图片支持** - 支持 PNG、JPEG、GIF 等格式
- 🔍 **快速复制** - 点击即可快速复制历史内容
- 📊 **历史管理** - 支持查看、删除、清空历史记录
- ⌨️ **快捷键** - 支持键盘快捷操作
- 🖥️ **系统托盘** - 支持最小化到托盘
- 🌐 **跨平台** - 支持 Windows、Mac、Linux

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Shift + V` | 显示/隐藏窗口 |
| `Delete` | 删除选中项 |

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + Vite
- **桌面**: Electron 29
- **存储**: electron-store

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run electron:dev
```

## 构建

```bash
# 构建应用
npm run electron:build
```

构建完成后，可执行文件将生成在 `release` 目录下：
- Windows: `release/ClipBoard Manager Setup 1.0.0.exe`
- Mac: `release/*.dmg`
- Linux: `release/*.AppImage`

## 项目结构

```
clipboard-manager/
├── electron/           # Electron 主进程代码
│   ├── main.ts         # 主进程入口
│   └── preload.ts      # 预加载脚本
├── src/                # React 前端代码
│   ├── components/     # React 组件
│   ├── types/          # TypeScript 类型定义
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # React 入口
├── public/             # 静态资源
├── package.json        # 项目配置
├── SPEC.md            # 规格文档
└── README.md
```

## 许可证

MIT
