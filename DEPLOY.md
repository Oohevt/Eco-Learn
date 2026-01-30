# Eco-Learn 部署指南

## 快速回答你的问题

### Q1: 前后端如何互通？
通过 **API 请求**。前端需要知道后端的 URL，通过环境变量 `VITE_API_URL` 配置。

### Q2: 部署后如何启动？
云平台会**自动启动**，无需手动操作。

### Q3: 别人如何访问？
通过**公网域名**访问，例如：
- 前端：`https://eco-learn.vercel.app`
- 后端：`https://eco-learn-backend.up.railway.app`

---

## 完整部署步骤

### 步骤 1：部署后端到 Railway

1. 访问 [railway.app](https://railway.app)
2. GitHub 登录 → 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择 `Eco-Learn` 仓库
5. **重要**：在 Root Directory 输入 `backend`
6. 点击 "Deploy"

**部署完成后**：
- Railway 会给你一个后端 URL，比如：`https://eco-learn-backend.up.railway.app`
- 复制这个 URL

**配置环境变量**（在 Railway 项目设置中）：
```
BACKEND_CORS_ORIGINS = ["https://eco-learn.vercel.app"]
SECRET_KEY = 你的随机密钥
```

---

### 步骤 2：配置前端

1. 打开 Vercel 项目设置
2. 找到 "Environment Variables"
3. 添加以下变量：
   ```
   名称: VITE_API_URL
   值: https://eco-learn-backend.up.railway.app/api
   ```
   （注意：把 URL 替换成你的 Railway 后端地址）

---

### 步骤 3：部署前端到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. GitHub 登录 → "Add New Project"
3. 选择 `Eco-Learn` 仓库
4. **重要**：在 Root Directory 输入 `frontend`
5. 配置环境变量（上面步骤 2 已设置）
6. 点击 "Deploy"

**部署完成后**：
- Vercel 会给你一个前端 URL，比如：`https://eco-learn.vercel.app`

---

### 步骤 4：更新后端 CORS 配置

回到 Railway 项目设置，更新 `BACKEND_CORS_ORIGINS`：

```
BACKEND_CORS_ORIGINS = ["https://eco-learn.vercel.app"]
```

（把域名替换成你的 Vercel 前端地址）

---

## 验证部署

1. 访问前端 URL，应该能看到主页
2. 尝试注册/登录，如果能成功说明前后端已打通
3. 检查浏览器控制台，看是否有 CORS 错误

---

## 架构图

```
用户浏览器
    ↓
https://eco-learn.vercel.app (前端)
    ↓ API 请求
https://eco-learn-backend.up.railway.app/api (后端)
```

---

## 常见问题

### CORS 错误
确保 Railway 的 `BACKEND_CORS_ORIGINS` 包含你的 Vercel 域名。

### API 请求失败
1. 检查前端的 `VITE_API_URL` 是否正确
2. 检查后端是否正常运行（访问后端 URL /health）

### 数据库问题
Railway 会自动提供 PostgreSQL，无需手动配置。

---

## 成本估算

| 平台 | 免费额度 | 超出后费用 |
|------|----------|------------|
| Vercel | ✅ 永久免费 | $20/月起（按需付费） |
| Railway | ❌ 无永久免费 | $5/月起 |

**预计月成本**: $5（仅后端，前端免费）
