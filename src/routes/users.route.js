const express = require('express');
const UserController = require('../controllers/users.controller');
const {authMiddleware, optionalAuthMiddleware} = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * 用户路由配置
 * 定义所有用户相关的API端点
 */

// ================================
// 认证相关路由（无需登录）
// ================================

/**
 * 用户注册
 * POST /api/auth/register
 * 请求体: { username, password, confirmPassword, email?, phone? }
 */
router.post('/auth/register', UserController.register);

/**
 * 用户登录
 * POST /api/auth/login
 * 请求体: { username, password, remember? }
 */
router.post('/auth/login', UserController.login);

/**
 * 检查用户名是否可用
 * GET /api/auth/check-username/:username
 */
router.get('/auth/check-username/:username', UserController.checkUsername);


/**
 * 用户登出
 * POST /api/auth/logout
 * 需要认证: 是
 */
router.post('/auth/logout', authMiddleware, UserController.logout);

/**
 * 验证token
 * GET /api/auth/verify
 * 需要认证: 是
 */
router.get('/auth/verify', authMiddleware, UserController.verifyToken);

// ================================
// 用户信息相关路由（需要登录）
// ================================

/**
 * 获取用户信息
 * GET /api/user/profile
 * 需要认证: 是
 */
router.get('/user/profile', authMiddleware, UserController.getProfile);

/**
 * 更新用户信息
 * PUT /api/user/profile
 * 需要认证: 是
 * 请求体: { nickname?, email?, phone?, avatar?, gender?, birthday?, bio? }
 */
router.put('/user/profile', authMiddleware, UserController.updateProfile);

/**
 * 修改密码
 * PUT /api/user/password
 * 需要认证: 是
 * 请求体: { oldPassword, newPassword, confirmPassword }
 */
router.put('/user/password', authMiddleware, UserController.changePassword);

// ================================
// 用户扩展功能路由（需要登录）
// ================================

/**
 * 获取用户订单列表
 * GET /api/user/orders
 * 需要认证: 是
 * 查询参数: ?page=1&limit=10&status=pending
 */
router.get('/user/orders', authMiddleware, (req, res) => {
    // TODO: 实现订单列表功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '订单功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 获取用户收藏列表
 * GET /api/user/favorites
 * 需要认证: 是
 * 查询参数: ?page=1&limit=10
 */
router.get('/user/favorites', authMiddleware, (req, res) => {
    // TODO: 实现收藏列表功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '收藏功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 添加商品到收藏
 * POST /api/user/favorites
 * 需要认证: 是
 * 请求体: { productId }
 */
router.post('/user/favorites', authMiddleware, (req, res) => {
    // TODO: 实现添加收藏功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '收藏功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 取消收藏
 * DELETE /api/user/favorites/:favoriteId
 * 需要认证: 是
 */
router.delete('/user/favorites/:favoriteId', authMiddleware, (req, res) => {
    // TODO: 实现取消收藏功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '收藏功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 批量取消收藏
 * DELETE /api/user/favorites/batch
 * 需要认证: 是
 * 请求体: { favoriteIds: [1, 2, 3] }
 */
router.delete('/user/favorites/batch', authMiddleware, (req, res) => {
    // TODO: 实现批量取消收藏功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '收藏功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 获取搜索历史
 * GET /api/user/search-history
 * 需要认证: 是
 */
router.get('/user/search-history', authMiddleware, (req, res) => {
    // TODO: 实现搜索历史功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '搜索历史功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 添加搜索记录
 * POST /api/user/search-history
 * 需要认证: 是
 * 请求体: { keyword }
 */
router.post('/user/search-history', authMiddleware, (req, res) => {
    // TODO: 实现添加搜索记录功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '搜索历史功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 清空搜索历史
 * DELETE /api/user/search-history
 * 需要认证: 是
 */
router.delete('/user/search-history', authMiddleware, (req, res) => {
    // TODO: 实现清空搜索历史功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '搜索历史功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

/**
 * 上传头像
 * POST /api/user/avatar
 * 需要认证: 是
 * Content-Type: multipart/form-data
 */
router.post('/user/avatar', authMiddleware, (req, res) => {
    // TODO: 实现头像上传功能
    res.status(501).json({
        success: false,
        code: 501,
        message: '头像上传功能尚未实现',
        timestamp: new Date().toISOString()
    });
});

// ================================
// 错误处理
// ================================

/**
 * 处理未匹配的路由
 */
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        code: 404,
        message: `路由 ${req.method} ${req.originalUrl} 不存在`,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;