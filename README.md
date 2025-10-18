# 毕业商城设计后端

## 项目状态
✅ **已完成功能**：用户注册、登录功能已完整实现并通过前后端联调测试  
✅ **数据库连接**：达梦数据库连接配置已解决  
🔧 **开发中**：商品管理、购物车、订单等功能待开发  

## 快速启动

### 环境要求
- Node.js 16+
- 达梦数据库 DM8
- pnpm 包管理器

### 启动步骤
```bash
# 安装依赖
pnpm install

# 启动服务
pnpm start

# 开发模式启动
pnpm dev
```

服务启动后访问：`http://localhost:3000`

## 1. 达梦数据库 Node.js 开发文档
- [开发文档](https://eco.dameng.com/document/dm/zh-cn/app-dev/JavaScript_NodeJs.html)

## 2. 达梦数据库 Node.js 编程指南
- [编程指南](https://eco.dameng.com/document/dm/zh-cn/pm/nodejs-rogramming-guide.html)
- [达梦数据库连接demo](https://eco.dameng.com/document/dm/zh-cn/app-dev/JavaScript_NodeJs.html#%E4%BA%94%E3%80%81%E5%8F%82%E8%80%83)

## 3. 项目架构说明
本项目采用 **MVC（Model-View-Controller）架构模式**，使用 **Express** 开发框架构建。

### 目录结构
- `src/models/` - 数据模型层
- `src/views/` - 这只是一个第三方模块视图，该项目的页面由Vue3负责，前后端分离架构(该views不是重点，可忽略或删除)
- `src/controllers/` - 控制器层
- `src/services/` - 业务逻辑层
- `src/routes/` - 路由配置
- `src/config/` - 配置文件

## 4. 达梦数据库连接配置重要说明 ⚠️

### 4.1 连接字符串格式
```javascript
const connectStr = "dm://用户名:用户名@IP地址:端口?连接参数";
```

### 4.2 重要配置项（容易踩坑）

#### 用户名和密码
- **用户名**：默认为 `SYSDBA`
- **密码**：需要设置正确的密码，如 `WKRwks20041104.`
- ⚠️ **注意**：用户名或密码错误会在 DM管理工具 的「安全」→「异常登录历史」中留下记录

#### IP和端口
- **IP地址**：本地开发通常为 `localhost`
- **端口**：达梦数据库默认端口为 `5236`

#### 连接参数（问号后面的参数）
这些参数在官方文档中未详细说明，但对连接成功至关重要：
- `autoCommit=false` - 关闭自动提交
- `loginEncrypt=false` - 关闭登录加密
- `password=实际密码` - 明确指定密码

### 4.3 完整示例
```javascript
const connectStr = "dm://SYSDBA:SYSDBA@localhost:5236?autoCommit=false&loginEncrypt=false&password=WKRwks20041104.";
```

### 4.4 常见问题排查
1. **连接超时**：检查数据库服务是否启动
2. **认证失败**：检查用户名密码是否正确
3. **参数错误**：确保连接参数格式正确
4. **端口占用**：确认5236端口未被其他服务占用

## 5. 已实现功能详细说明

### 5.1 用户认证模块 ✅

#### 功能概述
- ✅ 用户注册（包含密码确认验证）
- ✅ 用户登录（支持记住登录状态）
- ✅ JWT Token 认证
- ✅ 密码加密存储（bcrypt）
- ✅ 登录日志记录

#### API 接口

**用户注册**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "confirmPassword": "password123",
  "email": "user@example.com",    // 可选
  "phone": "13800138000"          // 可选
}
```

**用户登录**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "remember": true               // 可选，是否记住登录
}
```

**获取用户信息**
```http
GET /api/user/profile
Authorization: Bearer <JWT_TOKEN>
```

#### 数据库表结构
- `USERS` - 用户基本信息表
- `USER_LOGIN_LOGS` - 用户登录日志表

### 5.2 技术特性

#### 安全特性
- 🔐 **密码加密**：使用 bcrypt 进行密码哈希，盐值轮数为 12
- 🔑 **JWT 认证**：支持访问令牌和记住登录令牌
- 🛡️ **参数验证**：严格的输入参数验证和格式检查
- 📝 **登录日志**：记录所有登录尝试，包括失败记录

#### 响应格式
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 6. 达梦数据库开发注意事项 ⚠️

### 6.1 数据格式处理（重要）

#### 查询结果格式问题
达梦数据库的查询结果与主流数据库不同，需要特别处理：

```javascript
// 达梦数据库返回的是数组格式，即使只有一条记录
// 错误的处理方式：
const user = await db.query('SELECT * FROM USERS WHERE USERNAME = ?', [username]);
// user 是数组：[{ID: 1, USERNAME: 'test', ...}]

// 正确的处理方式：
static formatUserData(rawData) {
    // 处理数组格式数据（达梦数据库特有）
    if (Array.isArray(rawData) && rawData.length > 0) {
        const data = rawData[0]; // 取第一个元素
        return {
            id: data.ID,
            username: data.USERNAME,
            password_hash: data.PASSWORD_HASH,
            // ... 其他字段映射
        };
    }
    return null;
}
```

#### 字段名大小写问题
- 达梦数据库字段名默认为**大写**
- 需要在模型层进行字段名映射
- 建议统一使用下划线命名法

### 6.2 连接池管理

```javascript
// 正确的连接管理方式
let conn;
try {
    conn = await dmdb.getConnection(connectStr);
    const result = await conn.execute(sql, params);
    return result;
} catch (error) {
    console.error('数据库操作失败:', error);
    throw error;
} finally {
    if (conn) {
        await conn.close(); // 重要：必须关闭连接
    }
}
```

### 6.3 常见开发陷阱

1. **忘记处理数组格式结果**
   - 症状：用户数据解析失败，password_hash 为 undefined
   - 解决：在模型层正确处理数组格式数据

2. **连接未正确关闭**
   - 症状：连接池耗尽，应用卡死
   - 解决：使用 try-finally 确保连接关闭

3. **字段名映射错误**
   - 症状：数据库有数据但查询返回空
   - 解决：检查字段名大小写，使用正确的映射

4. **参数化查询格式**
   - 达梦数据库使用 `?` 作为参数占位符
   - 参数必须以数组形式传递

### 6.4 调试技巧

```javascript
// 添加调试日志
console.log('原始查询结果:', rawResult);
console.log('格式化后结果:', formattedResult);

// 检查数据类型
console.log('结果类型:', typeof result, Array.isArray(result));
```

## 7. 前后端联调说明

### 7.1 CORS 配置
项目已配置 CORS 中间件，支持跨域请求：
```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    // ...
});
```

### 7.2 前端配置
前端项目需要配置正确的 API 基础路径：
```javascript
// 前端 API 配置
const API_BASE_URL = 'http://localhost:3000/api';
```

### 7.3 测试验证
- ✅ 注册功能：前端表单 → 后端验证 → 数据库存储
- ✅ 登录功能：前端登录 → 后端认证 → JWT 返回
- ✅ 认证中间件：受保护路由的 Token 验证

## 8. 下一步开发计划

### 待实现功能
- 🔲 商品管理模块
- 🔲 购物车功能
- 🔲 订单管理系统
- 🔲 用户收藏功能
- 🔲 搜索功能
- 🔲 管理后台

### 技术优化
- 🔲 Redis 缓存集成
- 🔲 文件上传功能
- 🔲 数据库连接池优化
- 🔲 API 文档生成
- 🔲 单元测试覆盖
