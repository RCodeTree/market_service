const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/users.model');

/**
 * 用户业务逻辑服务
 * 处理用户相关的业务逻辑
 */
class UserService {
    /**
     * 用户注册
     * @param {Object} userData - 用户注册数据
     * @param {string} userData.username - 用户名
     * @param {string} userData.password - 密码
     * @param {string} userData.email - 邮箱（可选）
     * @param {string} userData.phone - 手机号（可选）
     * @returns {Object} 注册结果
     */
    static async register(userData) {
        try {
            const {username, password, email, phone} = userData;

            // 验证必填字段
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }

            // 验证用户名格式
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                throw new Error('用户名只能包含字母、数字和下划线，长度3-20位');
            }

            // 验证密码长度
            if (password.length < 6 || password.length > 20) {
                throw new Error('密码长度必须在6-20位之间');
            }

            // 检查用户名是否已存在
            const existingUser = await UserModel.findByUsername(username);
            if (existingUser) {
                throw new Error('用户名已存在');
            }

            // 如果提供了邮箱，验证邮箱格式
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('邮箱格式不正确');
            }

            // 如果提供了手机号，验证手机号格式
            if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
                throw new Error('手机号格式不正确');
            }

            // 加密密码
            const saltRounds = 12;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // 创建用户
            const newUser = await UserModel.create({
                username,
                password_hash,
                email,
                phone,
                agree_terms: 1,
                agree_privacy: 1
            });

            // 返回用户信息（不包含密码）
            const {password_hash: _, ...userInfo} = newUser;

            return {
                success: true,
                message: '注册成功',
                data: {
                    user: userInfo
                }
            };
        } catch (error) {
            console.error('用户注册失败:', error);
            return {
                success: false,
                message: error.message || '注册失败'
            };
        }
    }

    /**
     * 用户登录
     * @param {Object} credentials - 登录凭据
     * @param {string} credentials.username - 用户名
     * @param {string} credentials.password - 密码
     * @param {boolean} credentials.remember - 是否记住登录
     * @param {string} clientIp - 客户端IP
     * @param {string} userAgent - 用户代理
     * @returns {Object} 登录结果
     */
    static async login(credentials, clientIp, userAgent) {
        try {
            const {username, password, remember = false} = credentials;

            // 验证必填字段
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }

            // 查找用户
            const user = await UserModel.findByUsername(username);
            if (!user) {
                // 记录失败的登录尝试
                await this.logLoginAttempt({
                    user_id: null,
                    login_ip: clientIp,
                    user_agent: userAgent,
                    is_success: false,
                    fail_reason: '用户不存在'
                });

                throw new Error('用户名或密码错误');
            }

            // 检查用户状态
            if (user.status === 0) {
                await this.logLoginAttempt({
                    user_id: user.id,
                    login_ip: clientIp,
                    user_agent: userAgent,
                    is_success: false,
                    fail_reason: '账户已禁用'
                });

                throw new Error('账户已被禁用');
            }

            // 检查密码哈希是否存在
            if (!user.password_hash) {
                console.error('用户密码哈希为空:', {
                    userId: user.id,
                    username: user.username,
                    passwordHash: user.password_hash
                });

                await this.logLoginAttempt({
                    user_id: user.id,
                    login_ip: clientIp,
                    user_agent: userAgent,
                    is_success: false,
                    fail_reason: '用户数据异常'
                });

                throw new Error('用户数据异常，请联系管理员');
            }

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                await this.logLoginAttempt({
                    user_id: user.id,
                    login_ip: clientIp,
                    user_agent: userAgent,
                    is_success: false,
                    fail_reason: '密码错误'
                });

                throw new Error('用户名或密码错误');
            }

            // 生成JWT token
            const tokenPayload = {
                userId: user.id,
                username: user.username,
                type: 'access'
            };

            const tokenOptions = {
                expiresIn: remember ? '30d' : '24h',
                issuer: 'market-service',
                audience: 'market-client'
            };

            const token = jwt.sign(tokenPayload, this.getJwtSecret(), tokenOptions);

            // 生成记住我令牌（如果需要）
            let rememberToken = null;
            if (remember) {
                rememberToken = this.generateRememberToken();
            }

            // 更新用户登录信息
            await UserModel.updateLoginInfo(user.id, {
                ip: clientIp,
                remember_token: rememberToken
            });

            // 记录成功的登录
            await this.logLoginAttempt({
                user_id: user.id,
                login_ip: clientIp,
                user_agent: userAgent,
                is_success: true
            });

            // 返回登录结果（不包含密码）
            const {password_hash, remember_token, ...userInfo} = user;

            return {
                success: true,
                message: '登录成功',
                data: {
                    token,
                    user: userInfo,
                    expiresIn: remember ? '30天' : '24小时'
                }
            };
        } catch (error) {
            console.error('用户登录失败:', error);
            return {
                success: false,
                message: error.message || '登录失败'
            };
        }
    }

    /**
     * 获取用户信息
     * @param {number} userId - 用户ID
     * @returns {Object} 用户信息
     */
    static async getUserInfo(userId) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }

            // 返回用户信息（不包含敏感信息）
            const {password_hash, remember_token, ...userInfo} = user;

            return {
                success: true,
                data: userInfo
            };
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return {
                success: false,
                message: error.message || '获取用户信息失败'
            };
        }
    }

    /**
     * 更新用户信息
     * @param {number} userId - 用户ID
     * @param {Object} updateData - 更新数据
     * @returns {Object} 更新结果
     */
    static async updateProfile(userId, updateData) {
        try {
            const mapped = {...updateData};
            // 统一空值处理：空字符串转为 null，避免驱动类型转换异常
            ['nickname', 'email', 'phone', 'avatar'].forEach((k) => {
                if (Object.prototype.hasOwnProperty.call(mapped, k)) {
                    const v = mapped[k];
                    if (typeof v === 'string' && v.trim() === '') mapped[k] = null;
                }
            });
            // 性别：字符串映射为数值；空值则不更新
            if (Object.prototype.hasOwnProperty.call(mapped, 'gender')) {
                const g = mapped.gender;
                if (g === '' || g === null || typeof g === 'undefined') {
                    delete mapped.gender;
                } else if (typeof g === 'string') {
                    const gv = g === 'male' ? 1 : g === 'female' ? 2 : 0;
                    mapped.gender = gv;
                }
            }
            // 生日：统一传 YYYY-MM-DD 字符串，空值则不更新
            if (Object.prototype.hasOwnProperty.call(mapped, 'birthday')) {
                const b = mapped.birthday;
                if (!b || (typeof b === 'string' && b.trim() === '')) {
                    delete mapped.birthday;
                } else if (typeof b === 'string') {
                    const d = new Date(b);
                    if (isNaN(d.getTime())) {
                        delete mapped.birthday;
                    } else {
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        mapped.birthday = `${y}-${m}-${dd}`;
                    }
                } else if (b instanceof Date) {
                    const y = b.getFullYear();
                    const m = String(b.getMonth() + 1).padStart(2, '0');
                    const dd = String(b.getDate()).padStart(2, '0');
                    mapped.birthday = `${y}-${m}-${dd}`;
                } else {
                    delete mapped.birthday;
                }
            }
            // 验证邮箱格式（如果提供）
            if (Object.prototype.hasOwnProperty.call(mapped, 'email') && mapped.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) {
                throw new Error('邮箱格式不正确');
            }

            // 验证手机号格式（如果提供）
            if (Object.prototype.hasOwnProperty.call(mapped, 'phone') && mapped.phone && !/^1[3-9]\d{9}$/.test(mapped.phone)) {
                throw new Error('手机号格式不正确');
            }

            const updatedUser = await UserModel.updateProfile(userId, mapped);

            // 返回更新后的用户信息（不包含敏感信息）
            const {password_hash, remember_token, ...userInfo} = updatedUser;

            return {
                success: true,
                message: '更新成功',
                data: userInfo
            };
        } catch (error) {
            console.error('更新用户信息失败:', error);
            return {
                success: false,
                message: error.message || '更新失败'
            };
        }
    }

    /**
     * 验证JWT token
     * @param {string} token - JWT token
     * @returns {Object} 验证结果
     */
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.getJwtSecret());
            return {
                success: true,
                data: decoded
            };
        } catch (error) {
            console.error('Token验证失败:', error);
            return {
                success: false,
                message: 'Token无效或已过期'
            };
        }
    }

    /**
     * 记录登录尝试
     * @param {Object} logData - 登录日志数据
     */
    static async logLoginAttempt(logData) {
        try {
            await UserModel.createLoginLog(logData);
        } catch (error) {
            console.error('记录登录日志失败:', error);
            // 不抛出错误，避免影响主流程
        }
    }

    /**
     * 生成记住我令牌
     * @returns {string} 记住我令牌
     */
    static generateRememberToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * 获取JWT密钥
     * @returns {string} JWT密钥
     */
    static getJwtSecret() {
        return process.env.JWT_SECRET || 'market-service-jwt-secret-key-2024';
    }

    /**
     * 检查用户名是否可用
     * @param {string} username - 用户名
     * @returns {Object} 检查结果
     */
    static async checkUsernameAvailable(username) {
        try {
            if (!username) {
                throw new Error('用户名不能为空');
            }

            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                throw new Error('用户名只能包含字母、数字和下划线，长度3-20位');
            }

            const exists = await UserModel.checkUsernameExists(username);

            return {
                success: true,
                data: {
                    available: !exists,
                    message: exists ? '用户名已存在' : '用户名可用'
                }
            };
        } catch (error) {
            console.error('检查用户名失败:', error);
            return {
                success: false,
                message: error.message || '检查用户名失败'
            };
        }
    }

    /**
     * 修改密码
     * @param {number} userId - 用户ID
     * @param {Object} passwordData - 密码数据
     * @param {string} passwordData.oldPassword - 旧密码
     * @param {string} passwordData.newPassword - 新密码
     * @returns {Object} 修改结果
     */
    static async changePassword(userId, passwordData) {
        try {
            const {oldPassword, newPassword} = passwordData;

            if (!oldPassword || !newPassword) {
                throw new Error('旧密码和新密码不能为空');
            }

            if (newPassword.length < 6 || newPassword.length > 20) {
                throw new Error('新密码长度必须在6-20位之间');
            }

            // 获取用户信息
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }

            // 验证旧密码
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
            if (!isOldPasswordValid) {
                throw new Error('旧密码错误');
            }

            // 加密新密码
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 更新密码
            await UserModel.updateProfile(userId, {
                password_hash: newPasswordHash
            });

            return {
                success: true,
                message: '密码修改成功'
            };
        } catch (error) {
            console.error('修改密码失败:', error);
            return {
                success: false,
                message: error.message || '修改密码失败'
            };
        }
    }

    static async getFavorites(userId, params = {}) {
        try {
            const {favorites, total} = await UserModel.listFavorites(userId, params);
            return {success: true, data: {favorites, total}};
        } catch (error) {
            return {success: false, message: error.message || '获取收藏失败'};
        }
    }

    static async addFavorite(userId, productId) {
        try {
            const res = await UserModel.addFavorite(userId, productId);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '添加收藏失败'};
        }
    }

    static async removeFavorite(userId, favoriteId) {
        try {
            const res = await UserModel.removeFavorite(userId, favoriteId);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '移除收藏失败'};
        }
    }

    static async batchRemoveFavorites(userId, favoriteIds = []) {
        try {
            const res = await UserModel.batchRemoveFavorites(userId, favoriteIds);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '批量移除收藏失败'};
        }
    }

    static async getUserStats(userId) {
        try {
            const stats = await UserModel.getStats(userId);
            return {success: true, data: stats};
        } catch (error) {
            return {success: false, message: error.message || '获取统计失败'};
        }
    }

    static async listAddresses(userId) {
        try {
            const list = await UserModel.listAddresses(userId);
            return {success: true, data: list};
        } catch (error) {
            return {success: false, message: error.message || '获取地址失败'};
        }
    }

    static async createAddress(userId, data) {
        try {
            const required = ['receiver_name', 'receiver_phone', 'province', 'city', 'district', 'detail_address'];
            for (const f of required) {
                if (!String(data[f] || '').trim()) throw new Error('收货地址信息不完整');
            }
            const phone = String(data.receiver_phone || '').trim();
            if (!/^\d{5,20}$/.test(phone) && !/^1[3-9]\d{9}$/.test(phone)) {
                throw new Error('收货电话格式不正确');
            }
            const res = await UserModel.createAddress(userId, data);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '新增地址失败'};
        }
    }

    static async updateAddress(userId, id, data) {
        try {
            const res = await UserModel.updateAddress(userId, id, data);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '更新地址失败'};
        }
    }

    static async deleteAddress(userId, id) {
        try {
            const addr = await UserModel.getAddress(userId, id);
            if (!addr) {
                return {success: false, message: '地址不存在或已删除'};
            }
            const res = await UserModel.deleteAddress(userId, id);
            return {success: true, data: res};
        } catch (error) {
            return {success: false, message: error.message || '删除地址失败'};
        }
    }
}

module.exports = UserService;
