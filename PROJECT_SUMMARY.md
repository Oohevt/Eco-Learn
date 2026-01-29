# EconoLearn 项目总结

## 项目概述

**EconoLearn** 是一个经济学基础知识科普平台，采用**学术期刊风格**设计，用通俗、结构化、可视化的方式帮助用户理解经济学核心概念。

---

## 设计方向：学术期刊风格

### 美学定位
- **精致极简主义**：强调排版、留白和内容层次
- **纸质感设计**：米白色背景 + 纸质噪点纹理
- **学术专业感**：衬线体标题 + 无衬线体 UI

### 视觉识别
| 元素 | 选择 | 理由 |
|------|------|------|
| 衬线字体 | Crimson Pro | 学术期刊气质，优雅易读 |
| 无衬线字体 | DM Sans | 现代、清晰、功能性 |
| 背景色 | #f7f4ef | 米白色纸质感 |
| 主色调 | #c45d3a | 赭石红，温暖而专业 |
| 文字色 | #1a1814 | 深灰，高对比度 |

---

## 技术实现

### 前端技术栈
```
Vue 3 (Composition API + TypeScript)
├── Vite (构建)
├── Pinia (状态管理)
├── Vue Router (路由)
├── ECharts (图表)
└── @vueuse/core (工具)
```

### 目录结构
```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue      # 导航栏 + 进度环
│   │   └── AppFooter.vue      # 页脚
│   └── ui/
│       ├── ChapterCard.vue    # 章节卡片
│       ├── EChart.vue         # ECharts 封装
│       └── InteractiveChart.vue # 交互式图表
├── views/
│   ├── Home.vue               # 首页
│   ├── Learn.vue              # 学习列表
│   ├── Chapter.vue            # 章节详情
│   ├── Explore.vue            # 图表探索
│   └── Profile.vue            # 学习中心
├── stores/
│   └── chapter.ts             # 章节数据 + 进度管理
├── styles/
│   └── main.css               # 设计系统 + 样式变量
└── router/index.ts            # 路由配置
```

---

## 核心功能

### 1. 首页 (Home)
- Hero Section：标题 + 副标题 + CTA
- 经济学第一原理展示卡片
- 三大特色：通俗讲解、可视化图表、实战案例
- 章节预览网格
- 名言引用区块

### 2. 学习页 (Learn)
- 分类标签切换（全部/微观/宏观/金融）
- 学习进度条
- 章节卡片网格
- 状态显示（未开始/学习中/已完成）

### 3. 章节详情 (Chapter)
- 章节导航（上一章/下一章）
- 通俗解释区块（一句话白话版）
- 详细内容（分段落展示）
- 现实案例列表
- 相关图表链接
- 收藏 + 标记完成功能

### 4. 图表探索 (Explore)
- 图表卡片网格
- 模态框详情展示
- 交互式参数调节
- 图表说明文字

### 5. 学习中心 (Profile)
- 统计卡片（已完成/进度/收藏）
- 收藏内容列表
- 全部章节状态

---

## 章节内容（预置数据）

| 章节ID | 标题 | 分类 | 难度 |
|--------|------|------|------|
| supply-demand | 供给与需求 | 微观 | 入门 |
| price-mechanism | 价格形成机制 | 微观 | 入门 |
| inflation | 通货膨胀与通货紧缩 | 宏观 | 入门 |
| money-central-bank | 货币与央行 | 宏观 | 进阶 |
| market-failure | 市场失灵 | 微观 | 进阶 |

---

## 交互图表配置

| 图表ID | 说明 | 交互参数 |
|--------|------|---------|
| supply-demand-curve | 供需曲线 | 价格、数量 |
| price-equilibrium | 价格均衡 | 均衡点位置 |
| inflation-chart | 通胀率变化 | 年份 |
| money-supply | 货币供应量 | 利率、货币量 |
| externalities | 外部性成本 | 产量、成本 |

---

## CSS 设计系统

### 间距系统 (8pt Grid)
```css
--space-1: 0.25rem
--space-2: 0.5rem
--space-3: 0.75rem
--space-4: 1rem    /* 基础单位 */
--space-5: 1.25rem
--space-6: 1.5rem
--space-8: 2rem
--space-12: 3rem
--space-16: 4rem
--space-24: 6rem
```

### 圆角
```css
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 12px
--radius-full: 9999px
```

### 阴影
```css
--shadow-sm: 0 1px 2px rgba(26, 24, 20, 0.05)
--shadow-md: 0 4px 12px rgba(26, 24, 20, 0.08)
--shadow-lg: 0 8px 30px rgba(26, 24, 20, 0.1)
--shadow-elegant: 0 2px 8px rgba(26, 24, 20, 0.04), 0 12px 40px rgba(26, 24, 20, 0.06)
```

---

## 开发服务器

项目已启动，访问地址：
**http://localhost:5177/**

---

## 下一步开发

### 后端集成
- [ ] Spring Boot / FastAPI 后端搭建
- [ ] 用户认证系统（JWT）
- [ ] 章节内容 API
- [ ] 学习进度同步

### 功能扩展
- [ ] 知识图谱可视化
- [ ] 测试题目系统
- [ ] AI 辅助解释（调用 LLM API）
- [ ] 每日推荐功能

### 优化
- [ ] PWA 支持
- [ ] 离线缓存
- [ ] SEO 优化
- [ ] 性能优化（代码分割、懒加载）

---

## 文件清单

### 核心文件
- `frontend/src/main.ts` - 应用入口
- `frontend/src/App.vue` - 根组件
- `frontend/src/router/index.ts` - 路由配置
- `frontend/src/stores/chapter.ts` - 数据中心
- `frontend/src/styles/main.css` - 设计系统

### 页面组件
- `frontend/src/views/Home.vue`
- `frontend/src/views/Learn.vue`
- `frontend/src/views/Chapter.vue`
- `frontend/src/views/Explore.vue`
- `frontend/src/views/Profile.vue`

### 布局组件
- `frontend/src/components/layout/AppHeader.vue`
- `frontend/src/components/layout/AppFooter.vue`

### UI 组件
- `frontend/src/components/ui/ChapterCard.vue`
- `frontend/src/components/ui/EChart.vue`
- `frontend/src/components/ui/InteractiveChart.vue`

---

## 设计理念总结

这个项目避免了许多常见的"AI 生成"设计陷阱：
- ❌ 不使用 Inter/Roboto 等过度使用的字体
- ❌ 不使用紫色渐变等刻板配色
- ❌ 不使用千篇一律的卡片设计

相反，采用了：
- ✅ Crimson Pro + DM Sans 独特字体组合
- ✅ 米白 + 赭石红温暖专业配色
- ✅ 学术期刊风格精致排版
- ✅ 纸质感背景 + 噪点纹理
- ✅ 细腻的微交互和过渡动画
