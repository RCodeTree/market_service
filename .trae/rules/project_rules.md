# 仿京东商城项目规则

## 项目概述

本项目是一个仿京东商城的毕业设计项目，采用前后端分离架构，旨在实现一个功能完整的电商平台。
[参考链接](https://www.jd.com/)

### 技术栈
- **前端**: Vue 3 + Vite + JavaScript/TypeScript
- **后端**: Node.js + Express.js
- **数据库**: 达梦数据库 (DM8)
- **包管理**: pnpm

## 项目结构

```
MarketForGanerate/
├── market_page/          # 前端项目
│   ├── src/
│   │   ├── components/   # 公共组件目录
│   │   ├── views/        # 页面目录
│   │   ├── router/       # 路由配置
│   │   ├── store/        # 状态管理
│   │   ├── api/          # API接口
│   │   ├── utils/        # 工具区域
│   │   └── assets/       # 静态资源
│   └── public/           # 公共资源
└── market_service/       # 后端项目
    ├── src/
    │   ├── controllers/  # 控制器
    │   ├── services/     # 业务逻辑
    │   ├── models/       # 数据模型
    │   ├── routes/       # 路由定义
    │   ├── middleware/   # 中间件
    │   ├── config/       # 配置文件
    │   └── utils/        # 工具函数
    ├── data/             # 数据库SQL初始化相关(包含数据库脚本和初始化数据、有关数据库的操作，比如：前后端的交互，如crud都要根据该目录下的数据库脚本进行参考；初始化字段都为大写，开发过程中需要注意)
    └── public/           # 静态资源
```

## 开发规范

### 1. 代码风格规范

#### 前端 (Vue 3)
- 使用 Composition API 优先
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case
- 使用 `<script setup>` 语法
- CSS 使用 scoped 样式
- 响应式设计，支持移动端适配

#### 后端 (Node.js + Express)
- 使用 ES6+ 语法
- 文件命名采用 camelCase
- 路由文件以 `.route.js` 结尾
- 控制器文件以 `.controller.js` 结尾
- 服务文件以 `.service.js` 结尾
- 模型文件以 `.model.js` 结尾

### 2. 目录结构规范

#### 前端目录规范
```
src/
├── components/           # 公共组件
│   ├── common/          # 通用组件 (Header, Footer, Loading等)
│   ├── product/         # 商品相关组件
│   ├── user/            # 用户相关组件
│   └── cart/            # 购物车相关组件
├── views/               # 页面组件
│   ├── home/            # 首页
│   ├── product/         # 商品页面
│   ├── user/            # 用户中心
│   ├── cart/            # 购物车
│   └── order/           # 订单页面
├── router/              # 路由配置
├── store/               # Pinia状态管理
│   ├── modules/         # 模块化store
│   └── index.js         # store入口
├── api/                 # API接口
│   ├── user.js          # 用户相关API
│   ├── product.js       # 商品相关API
│   └── order.js         # 订单相关API
├── utils/               # 工具函数
│   ├── request.js       # HTTP请求封装
│   ├── auth.js          # 认证相关
│   └── common.js        # 通用工具
└── assets/              # 静态资源
    ├── images/          # 图片资源
    ├── styles/          # 样式文件
    └── icons/           # 图标资源
```

#### 后端目录规范
```
src/
├── controllers/         # 控制器层
│   ├── user.controller.js
│   ├── product.controller.js
│   ├── order.controller.js
│   └── auth.controller.js
├── services/            # 业务逻辑层
│   ├── user.service.js
│   ├── product.service.js
│   └── order.service.js
├── models/              # 数据模型层
│   ├── user.model.js
│   ├── product.model.js
│   └── order.model.js
├── routes/              # 路由层
│   ├── user.route.js
│   ├── product.route.js
│   └── order.route.js
├── middleware/          # 中间件
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
├── config/              # 配置文件
│   ├── db.js            # 数据库配置
│   └── app.config.js    # 应用配置
└── utils/               # 工具函数
    ├── response.js      # 响应格式化
    ├── validation.js    # 数据验证
    └── encryption.js    # 加密工具
```

### 3. 数据库规范

#### 达梦数据库使用规范
- 使用连接池管理数据库连接
- 所有SQL操作必须使用参数化查询防止SQL注入
- 数据库表名使用下划线命名法 (snake_case)
- 字段名使用下划线命名法
- 主键统一命名为 `id`
- 创建时间字段命名为 `created_at`
- 更新时间字段命名为 `updated_at`

### 4. API接口规范

#### RESTful API设计
- 使用标准HTTP方法 (GET, POST, PUT, DELETE)
- URL使用名词复数形式
- 统一的响应格式
- 适当的HTTP状态码

#### 响应格式标准
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应格式
```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 5. 功能模块规范

#### 核心功能模块
1. **用户模块**
   - 用户注册/登录
   - 用户信息管理
   - 密码修改
   - 头像上传

2. **商品模块**
   - 商品列表展示
   - 商品详情查看
   - 商品搜索
   - 商品分类

3. **购物车模块**
   - 添加商品到购物车
   - 购物车商品管理
   - 购物车结算

4. **订单模块**
   - 订单创建
   - 订单查询
   - 订单状态管理

5. **管理后台模块**
   - 商品管理
   - 用户管理
   - 订单管理
   - 数据统计

### 6. 安全规范

#### 前端安全
- 输入数据验证
- XSS防护
- CSRF防护
- 敏感信息不在前端存储

#### 后端安全
- 参数验证
- SQL注入防护
- 身份认证 (JWT)
- 权限控制
- 密码加密存储

### 7. 性能优化规范

#### 前端优化
- 组件懒加载
- 图片懒加载
- 代码分割
- 缓存策略

#### 后端优化
- 数据库连接池
- 查询优化
- 缓存机制
- 接口限流

### 8. 开发流程规范

#### Git使用规范
- 分支命名: `feature/功能名`, `bugfix/问题描述`
- 提交信息格式: `type(scope): description`
- 代码审查制度

#### 测试规范
- 单元测试覆盖率 > 80%
- 集成测试
- 接口测试
- 前端组件测试

### 9. 部署规范

#### 环境配置
- 开发环境 (development)
- 测试环境 (testing)
- 生产环境 (production)

#### 部署流程
- 代码构建
- 环境变量配置
- 数据库迁移
- 服务启动

### 10. 文档规范

#### 必需文档
- API接口文档
- 数据库设计文档
- 部署文档
- 用户使用手册

#### 代码注释规范
- 函数/方法必须有注释
- 复杂逻辑必须有注释
- 接口参数说明
- 返回值说明

## 项目启动命令

### 前端启动
```bash
cd market_page
pnpm install
pnpm dev
```

### 后端启动
```bash
cd market_service
pnpm install
pnpm start
```

## 注意事项

1. 严格按照目录结构组织代码
2. 遵循代码风格规范
3. 确保数据库连接安全
4. 定期备份数据库
5. 及时更新依赖包
6. 保持代码整洁和可维护性

---

**项目负责人**: [阿rong]  
**创建时间**: 2024年  
**最后更新**: 2024年