<h1 align="center">Atlas Frontend</h1>
<p align="center">Atlas 微服务管理平台前端</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-brightgreen.svg" alt="Vue 3.4"/>
  <img src="https://img.shields.io/badge/Vite-5.4-blue.svg" alt="Vite 5.4"/>
  <img src="https://img.shields.io/badge/Ant%20Design%20Vue-4.x-1677ff.svg" alt="Ant Design Vue 4.x"/>
  <img src="https://img.shields.io/badge/Pinia-2.1-yellow.svg" alt="Pinia 2.1"/>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License"/>
</p>

---

## 简介

Atlas Frontend 是 [Atlas](https://github.com/your-org/atlas) 微服务管理平台的前端项目，基于 Vue 3 + Vite + Ant Design Vue 4.x 构建，提供用户管理、角色管理、菜单管理、部门管理、字典管理、服务监控、在线用户等功能的可视化操作界面。

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 核心框架 | Vue | 3.4 |
| 构建工具 | Vite | 5.4 |
| UI 组件库 | Ant Design Vue | 4.x |
| 图标库 | @ant-design/icons-vue | 7.x |
| 路由 | Vue Router | 4.3 |
| 状态管理 | Pinia | 2.1 |
| HTTP 客户端 | Axios | 1.7 |

## 项目结构

```
atlas-frontend
├── public/                         静态资源
├── src/
│   ├── api/                        API 接口模块
│   │   ├── auth.js                 ├── 认证：登录 / 登出 / 刷新
│   │   ├── user.js                 ├── 用户管理
│   │   ├── role.js                 ├── 角色管理
│   │   ├── menu.js                 ├── 菜单管理
│   │   ├── dept.js                 ├── 部门管理
│   │   └── dict.js                 └── 字典管理
│   │
│   ├── layout/                     布局组件
│   │   ├── index.vue               ├── 主布局（a-layout）
│   │   ├── Sidebar.vue             ├── 侧边栏导航菜单
│   │   └── Navbar.vue              └── 顶部导航栏
│   │
│   ├── views/                      页面组件
│   │   ├── login/Login.vue         ├── 登录页
│   │   ├── dashboard/Dashboard.vue ├── 首页仪表盘
│   │   ├── system/                 ├── 系统管理
│   │   │   ├── User.vue            │   ├── 用户管理
│   │   │   ├── Role.vue            │   ├── 角色管理
│   │   │   ├── Menu.vue            │   ├── 菜单管理（树形表格）
│   │   │   ├── Dept.vue            │   ├── 部门管理（树形表格）
│   │   │   └── Dict.vue            │   └── 字典管理（左右分栏）
│   │   └── monitor/                └── 系统监控
│   │       ├── Server.vue              ├── 服务监控
│   │       └── Online.vue              └── 在线用户
│   │
│   ├── stores/user.js              Pinia 用户状态
│   ├── utils/request.js            Axios 封装
│   ├── router/index.js             路由配置
│   ├── styles/index.css            全局样式
│   ├── App.vue                     根组件
│   └── main.js                     入口文件
│
├── index.html
├── vite.config.js
└── package.json
```

## 页面预览

```
┌─────────────────────────────────────────────────┐
│  Atlas                │  首页            admin ▾ │
│───────────────────────│─────────────────────────│
│  ▸ 首页               │                         │
│  ▾ 系统管理           │   ┌─────┐ ┌─────┐      │
│    用户管理            │   │用户数│ │角色数│ ... │
│    角色管理            │   └─────┘ └─────┘      │
│    菜单管理            │                         │
│    部门管理            │   ┌───────────────────┐ │
│    字典管理            │   │ 欢迎使用 Atlas    │ │
│  ▾ 系统监控           │   │ 管理系统          │ │
│    服务监控            │   └───────────────────┘ │
│    在线用户            │                         │
└─────────────────────────────────────────────────┘
```

## 快速开始

### 环境准备

- Node.js 18+
- npm 9+ 或 pnpm 8+

### 1. 克隆项目

```bash
git clone https://github.com/your-org/atlas-frontend.git
cd atlas-frontend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:5173`

### 4. 构建生产包

```bash
npm run build
```

产物输出到 `dist/` 目录。

## 接口代理

开发环境通过 Vite 代理转发 API 请求到后端网关：

| 前端路径 | 代理目标 | 说明 |
|----------|---------|------|
| `/api/**` | `http://localhost:8080` | 网关统一入口 |

## 路由结构

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | Login.vue | 登录页 |
| `/dashboard` | Dashboard.vue | 首页仪表盘 |
| `/system/user` | User.vue | 用户管理 |
| `/system/role` | Role.vue | 角色管理 |
| `/system/menu` | Menu.vue | 菜单管理 |
| `/system/dept` | Dept.vue | 部门管理 |
| `/system/dict` | Dict.vue | 字典管理 |
| `/monitor/server` | Server.vue | 服务监控 |
| `/monitor/online` | Online.vue | 在线用户 |

## 开发规范

- 统一请求：所有 API 通过 `src/utils/request.js` 封装的 Axios 实例发起，自动注入 Token、统一错误提示
- 状态管理：用户认证状态通过 Pinia store 管理，Token 持久化到 localStorage
- 路由守卫：未登录自动跳转 `/login`，Token 失效（401）自动登出
- 组件风格：表格使用 `columns` 配置式，表单验证绑定在 `a-form :rules`，弹窗使用 `a-modal v-model:open`

## License

[MIT](LICENSE)
