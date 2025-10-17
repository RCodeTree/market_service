const UserService = require('../services/users.service');

/**
 * JWT认证中间件
 * 验证用户身份
 */
const authMiddleware = (req, res, next) => {
  try {
    // 获取token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: '未提供有效的认证令牌',
        timestamp: new Date().toISOString()
      });
    }
    
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    // 验证token
    const verifyResult = UserService.verifyToken(token);
    
    if (!verifyResult.success) {
      return res.status(401).json({
        success: false,
        code: 401,
        message: verifyResult.message,
        timestamp: new Date().toISOString()
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = verifyResult.data;
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(401).json({
      success: false,
      code: 401,
      message: '认证失败',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则继续
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const verifyResult = UserService.verifyToken(token);
      
      if (verifyResult.success) {
        req.user = verifyResult.data;
      }
    }
    
    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    next(); // 继续执行，不阻止请求
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};