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
 * 请求体: { nickname?, email?, phone?, avatar?, gender?, birthday? }
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

// 订单相关已迁移至 orders.route.js，避免重复定义

/**
 * 获取用户收藏列表
 * GET /api/user/favorites
 * 需要认证: 是
 * 查询参数: ?page=1&limit=10
 */
router.get('/user/favorites', authMiddleware, UserController.getFavorites);

/**
 * 添加商品到收藏
 * POST /api/user/favorites
 * 需要认证: 是
 * 请求体: { productId }
 */
router.post('/user/favorites', authMiddleware, UserController.addFavorite);

/**
 * 取消收藏
 * DELETE /api/user/favorites/:favoriteId
 * 需要认证: 是
 */
router.delete('/user/favorites/:favoriteId', authMiddleware, UserController.removeFavorite);

/**
 * 批量取消收藏
 * DELETE /api/user/favorites/batch
 * 需要认证: 是
 * 请求体: { favoriteIds: [1, 2, 3] }
 */
router.delete('/user/favorites/batch', authMiddleware, UserController.batchRemoveFavorites);

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
 * 请求体: { dataUrl: 'data:image/png;base64,...' }
 */
router.post('/user/avatar', authMiddleware, UserController.uploadAvatar);

/**
 * 获取用户统计
 * GET /api/user/stats
 * 需要认证: 是
 */
router.get('/user/stats', authMiddleware, UserController.getUserStats);

/**
 * 收货地址 CRUD
 */
router.get('/user/addresses', authMiddleware, UserController.getAddresses);
router.post('/user/addresses', authMiddleware, UserController.addAddress);
router.put('/user/addresses/:id', authMiddleware, UserController.updateAddress);
router.delete('/user/addresses/:id', authMiddleware, UserController.deleteAddress);

// ================================
// 错误处理
// ================================

// 404 交由应用级处理，避免影响其他模块路由

module.exports = router;
