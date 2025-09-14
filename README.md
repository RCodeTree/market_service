# 毕业商城设计后端(已经将达梦数据库连接部分解决，相对其他主流数据库，该国产数据库还是比较难调教的)

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
