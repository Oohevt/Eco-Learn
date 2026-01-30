# EconoLearn 经济学基础知识科普平台

前后端分离项目，使用 EdgeOne Pages + Hono + EdgeOne KV 部署。

## 项目结构

```
Economy/
├── frontend/          # Vue 3 前端
│   ├── src/
│   └── dist/          # 构建产物
└── backend/           # Hono 后端
    ├── src/
    │   ├── routes/    # API 路由
    │   ├── schemas/   # 数据验证
    │   ├── db/        # KV 存储层
    │   └── utils/     # 工具函数
    ├── scripts/       # 数据初始化脚本
    ├── package.json
    └── wrangler.toml  # Cloudflare Workers 配置
```

## 技术栈

### Frontend
- Vue 3 + TypeScript
- Pinia 状态管理
- Vue Router
- Axios HTTP 客户端

### Backend
- Hono Web 框架
- EdgeOne KV 存储
- JWT 认证
- Zod 数据验证

## 本地开发

### 后端

```bash
cd backend
npm install
npm run dev
```

后端运行在 `http://localhost:8787`

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`

## 部署

### 1. 创建 EdgeOne KV 命名空间

在 EdgeOne 控制台创建 KV 命名空间，获取 Namespace ID

### 2. 配置后端

编辑 `backend/wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

[vars]
JWT_SECRET = "change-this-to-a-random-secret"
```

### 3. 部署后端

```bash
cd backend
npm install
npm run deploy
```

### 4. 初始化数据

#### 创建管理员账户

```bash
curl -X POST https://your-worker-url/init-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

#### 初始化章节示例数据

```bash
curl -X POST https://your-worker-url/init-data
```

### 5. 构建并部署前端

```bash
cd frontend
npm run build
```

使用 EdgeOne Pages MCP 部署 `frontend/dist` 目录

### 6. 配置前端环境变量

在 EdgeOne Pages 配置中设置：

```bash
VITE_API_URL=https://your-worker-url/api
```

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/logout` - 用户登出

### 章节
- `GET /api/chapters` - 获取章节列表
- `GET /api/chapters/stats` - 获取分类统计
- `GET /api/chapters/:id` - 获取章节详情
- `POST /api/chapters` - 创建章节（管理员）
- `PUT /api/chapters/:id` - 更新章节（管理员）
- `DELETE /api/chapters/:id` - 删除章节（管理员）

### 用户进度
- `GET /api/user/progress` - 获取用户进度
- `POST /api/user/progress` - 更新学习进度
- `GET /api/user/progress/:chapterId` - 获取单章节进度
