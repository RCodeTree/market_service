const UserService = require('../services/users.service');

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
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: '两次输入的密码不一致',
                    timestamp: new Date().toISOString()
                });
            }

            const result = await UserService.register({
                username,
                password,
                email,
                phone
            });

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    code: 201,
                    message: result.message,
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('注册控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: result.message,
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('登录控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: '获取用户信息成功',
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(404).json({
                    success: false,
                    code: 404,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('获取用户信息控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: result.message,
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('更新用户信息控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: '两次输入的新密码不一致',
                    timestamp: new Date().toISOString()
                });
            }

            const result = await UserService.changePassword(userId, {
                oldPassword,
                newPassword
            });

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('修改密码控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: '检查完成',
                    data: result.data,
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: result.message,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('检查用户名控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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

            return res.status(200).json({
                success: true,
                code: 200,
                message: '登出成功',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('登出控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
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
                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: 'Token有效',
                    data: {
                        valid: true,
                        user: result.data
                    },
                    timestamp: new Date().toISOString()
                });
            } else {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    message: 'Token无效',
                    data: {
                        valid: false
                    },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('验证token控制器错误:', error);
            return res.status(500).json({
                success: false,
                code: 500,
                message: '服务器内部错误',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = UserController;