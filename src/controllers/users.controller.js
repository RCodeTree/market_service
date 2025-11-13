const UserService = require('../services/users.service');
const { ok, error, jsonResponse } = require('../utils/response');

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
class UserController {
    /**
     * 用户注册
     * POST /api/auth/register
     */
    static async register(req, res) {
        try {
            const {username, password, confirmPassword, email, phone} = req.body;

            // 验证确认密码
            if (password !== confirmPassword) {
                return error(res, 400, '两次输入的密码不一致');
            }

            const result = await UserService.register({
                username,
                password,
                email,
                phone
            });

            if (result.success) {
                return jsonResponse(res, 201, {
                    success: true,
                    code: 201,
                    message: result.message,
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return error(res, 400, result.message);
            }
        } catch (error) {
            console.error('注册控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 用户登录
     * POST /api/auth/login
     */
    static async login(req, res) {
        try {
            const {username, password, remember} = req.body;

            // 获取客户端信息
            const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await UserService.login(
                {username, password, remember},
                clientIp,
                userAgent
            );

            if (result.success) {
                return ok(res, result.message, result.data);
            } else {
                return error(res, 401, result.message);
            }
        } catch (error) {
            console.error('登录控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 获取用户信息
     * GET /api/user/profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            const result = await UserService.getUserInfo(userId);

            if (result.success) {
                return ok(res, '获取用户信息成功', result.data);
            } else {
                return error(res, 404, result.message);
            }
        } catch (error) {
            console.error('获取用户信息控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 更新用户信息
     * PUT /api/user/profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;

            // 移除不允许直接更新的字段
            const forbiddenFields = ['id', 'username', 'password_hash', 'status', 'created_at', 'updated_at'];
            forbiddenFields.forEach(field => {
                delete updateData[field];
            });

            const result = await UserService.updateProfile(userId, updateData);

            if (result.success) {
                return ok(res, result.message, result.data);
            } else {
                return error(res, 400, result.message);
            }
        } catch (error) {
            console.error('更新用户信息控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 修改密码
     * PUT /api/user/password
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const {oldPassword, newPassword, confirmPassword} = req.body;

            // 验证确认密码
            if (newPassword !== confirmPassword) {
                return error(res, 400, '两次输入的新密码不一致');
            }

            const result = await UserService.changePassword(userId, {
                oldPassword,
                newPassword
            });

            if (result.success) {
                return ok(res, result.message);
            } else {
                return error(res, 400, result.message);
            }
        } catch (error) {
            console.error('修改密码控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 检查用户名是否可用
     * GET /api/auth/check-username/:username
     */
    static async checkUsername(req, res) {
        try {
            const {username} = req.params;

            const result = await UserService.checkUsernameAvailable(username);

            if (result.success) {
                return ok(res, '检查完成', result.data);
            } else {
                return error(res, 400, result.message);
            }
        } catch (error) {
            console.error('检查用户名控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 用户登出
     * POST /api/auth/logout
     */
    static async logout(req, res) {
        try {
            // 在实际应用中，可以将token加入黑名单
            // 这里简单返回成功响应，客户端删除token

            return ok(res, '登出成功');
        } catch (error) {
            console.error('登出控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    /**
     * 验证token
     * GET /api/auth/verify
     */
    static async verifyToken(req, res) {
        try {
            // 如果能到达这里，说明token已经通过中间件验证
            const userId = req.user.userId;

            const result = await UserService.getUserInfo(userId);

            if (result.success) {
                return ok(res, 'Token有效', { valid: true, user: result.data });
            } else {
                return error(res, 401, 'Token无效', 401, { data: { valid: false } });
            }
        } catch (error) {
            console.error('验证token控制器错误:', error);
            return error(res, 500, '服务器内部错误');
        }
    }

    static async getFavorites(req, res) {
        try {
            const userId = req.user.userId;
            const { page = 1, pageSize = 12, sort = 'latest' } = req.query;
            const result = await UserService.getFavorites(userId, { page: Number(page), pageSize: Number(pageSize), sort });
            if (result.success) {
                return ok(res, '获取收藏成功', result.data);
            }
            return error(res, 400, result.message || '获取收藏失败');
        } catch (e) {
            return error(res, 500, '服务器内部错误');
        }
    }

    static async addFavorite(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.body;
            const result = await UserService.addFavorite(userId, productId);
            if (result.success) {
                return ok(res, '添加收藏成功', result.data);
            }
            return error(res, 400, result.message || '添加收藏失败');
        } catch (e) {
            return error(res, 500, '服务器内部错误');
        }
    }

    static async removeFavorite(req, res) {
        try {
            const userId = req.user.userId;
            const { favoriteId } = req.params;
            const result = await UserService.removeFavorite(userId, Number(favoriteId));
            if (result.success) {
                return ok(res, '移除收藏成功', result.data);
            }
            return error(res, 400, result.message || '移除收藏失败');
        } catch (e) {
            return error(res, 500, '服务器内部错误');
        }
    }

    static async batchRemoveFavorites(req, res) {
        try {
            const userId = req.user.userId;
            const { favoriteIds = [] } = req.body;
            const result = await UserService.batchRemoveFavorites(userId, favoriteIds);
            if (result.success) {
                return ok(res, '批量移除收藏成功', result.data);
            }
            return error(res, 400, result.message || '批量移除收藏失败');
        } catch (e) {
            return error(res, 500, '服务器内部错误');
        }
    }
}

module.exports = UserController;
