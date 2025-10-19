const {GetDatabase} = require('../config/db');

/**
 * 用户数据模型
 * 负责用户相关的数据库操作
 */
class UserModel {
    /**
     * 根据用户名查找用户
     * @param {string} username - 用户名
     * @returns {Object|null} 用户信息或null
     */
    static async findByUsername(username) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const sql = `
                SELECT id,
                       username,
                       password_hash,
                       nickname,
                       email,
                       phone,
                       avatar,
                       gender,
                       birthday,
                       bio,
                       level,
                       points,
                       balance,
                       status,
                       last_login_time,
                       last_login_ip,
                       login_count,
                       remember_token,
                       email_verified,
                       phone_verified,
                       agree_terms,
                       agree_privacy,
                       created_at,
                       updated_at
                FROM MARKET.USERS
                WHERE username = ?
                  AND status != 0
            `;

            const result = await conn.execute(sql, [username]);

            if (result.rows && result.rows.length > 0) {
                return this.formatUserData(result.rows[0]);
            }

            return null;
        } catch (error) {
            console.error('查找用户失败:', error);
            throw new Error('查找用户失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 根据用户ID查找用户
     * @param {number} userId - 用户ID
     * @returns {Object|null} 用户信息或null
     */
    static async findById(userId) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const sql = `
                SELECT id,
                       username,
                       nickname,
                       email,
                       phone,
                       avatar,
                       gender,
                       birthday,
                       bio,
                       level,
                       points,
                       balance,
                       status,
                       last_login_time,
                       last_login_ip,
                       login_count,
                       email_verified,
                       phone_verified,
                       created_at,
                       updated_at
                FROM MARKET.USERS
                WHERE id = ?
                  AND status != 0
            `;

            const result = await conn.execute(sql, [userId]);

            if (result.rows && result.rows.length > 0) {
                return this.formatUserData(result.rows[0]);
            }

            return null;
        } catch (error) {
            console.error('查找用户失败:', error);
            throw new Error('查找用户失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 创建新用户
     * @param {Object} userData - 用户数据
     * @returns {Object} 创建的用户信息
     */
    static async create(userData) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            // 生成用户ID（使用时间戳 + 随机数）
            const userId = Date.now() + Math.floor(Math.random() * 1000);

            const sql = `
                INSERT INTO MARKET.USERS (id, username, password_hash, nickname, email, phone,
                                          agree_terms, agree_privacy, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            const params = [
                userId,
                userData.username,
                userData.password_hash,
                userData.nickname || userData.username,
                userData.email || null,
                userData.phone || null,
                userData.agree_terms || 1,
                userData.agree_privacy || 1
            ];

            await conn.execute(sql, params);
            await conn.commit();

            // 返回创建的用户信息（不包含密码）
            return await this.findById(userId);
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            console.error('创建用户失败:', error);

            // 检查是否是用户名重复错误
            if (error.message && error.message.includes('UNIQUE')) {
                throw new Error('用户名已存在');
            }

            throw new Error('创建用户失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 更新用户登录信息
     * @param {number} userId - 用户ID
     * @param {Object} loginInfo - 登录信息
     */
    static async updateLoginInfo(userId, loginInfo) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const sql = `
                UPDATE MARKET.USERS
                SET last_login_time = CURRENT_TIMESTAMP,
                    last_login_ip   = ?,
                    login_count     = login_count + 1,
                    remember_token  = ?,
                    updated_at      = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await conn.execute(sql, [
                loginInfo.ip,
                loginInfo.remember_token || null,
                userId
            ]);

            await conn.commit();
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            console.error('更新登录信息失败:', error);
            throw new Error('更新登录信息失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 记录登录日志
     * @param {Object} logData - 登录日志数据
     */
    static async createLoginLog(logData) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const logId = Date.now() + Math.floor(Math.random() * 1000);

            const sql = `
                INSERT INTO MARKET.USER_LOGIN_LOGS (id, user_id, login_ip, user_agent, device, location,
                                                    is_success, fail_reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;

            await conn.execute(sql, [
                logId,
                logData.user_id,
                logData.login_ip,
                logData.user_agent || null,
                logData.device || null,
                logData.location || null,
                logData.is_success ? 1 : 0,
                logData.fail_reason || null
            ]);

            await conn.commit();
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            console.error('记录登录日志失败:', error);
            // 登录日志失败不影响主流程，只记录错误
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 更新用户信息
     * @param {number} userId - 用户ID
     * @param {Object} updateData - 更新数据
     */
    static async updateProfile(userId, updateData) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const allowedFields = ['nickname', 'email', 'phone', 'avatar', 'gender', 'birthday', 'bio'];
            const updateFields = [];
            const updateValues = [];

            // 只更新允许的字段
            for (const field of allowedFields) {
                if (updateData.hasOwnProperty(field)) {
                    updateFields.push(`${field} = ?`);
                    updateValues.push(updateData[field]);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('没有可更新的字段');
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateValues.push(userId);

            const sql = `UPDATE MARKET.USERS
                         SET ${updateFields.join(', ')}
                         WHERE id = ?`;

            await conn.execute(sql, updateValues);
            await conn.commit();

            return await this.findById(userId);
        } catch (error) {
            if (conn) {
                await conn.rollback();
            }
            console.error('更新用户信息失败:', error);
            throw new Error('更新用户信息失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 检查用户名是否存在
     * @param {string} username - 用户名
     * @returns {boolean} 是否存在
     */
    static async checkUsernameExists(username) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const sql = 'SELECT COUNT(*) as count FROM MARKET.USERS WHERE username = ?';
            const result = await conn.execute(sql, [username]);

            return result.rows[0].COUNT > 0;
        } catch (error) {
            console.error('检查用户名失败:', error);
            throw new Error('检查用户名失败');
        } finally {
            if (conn) {
                await conn.close();
            }
        }
    }

    /**
     * 格式化用户数据
     * @param {Object} rawData - 原始数据
     * @returns {Object} 格式化后的数据
     */
    static formatUserData(rawData) {
        if (!rawData) return null;

        // 处理达梦数据库返回的数组格式数据
        if (Array.isArray(rawData)) {
            // 根据findByUsername查询的字段顺序映射
            const [
                id, username, password_hash, nickname, email, phone, avatar, gender,
                birthday, bio, level, points, balance, status, last_login_time,
                last_login_ip, login_count, remember_token, email_verified,
                phone_verified, agree_terms, agree_privacy, created_at, updated_at
            ] = rawData;

            return {
                id,
                username,
                password_hash,
                nickname,
                email,
                phone,
                avatar,
                gender,
                birthday,
                bio,
                level,
                points,
                balance,
                status,
                last_login_time,
                last_login_ip,
                login_count,
                remember_token,
                email_verified,
                phone_verified,
                agree_terms,
                agree_privacy,
                created_at,
                updated_at
            };
        }

        // 处理对象格式数据（兼容性保留）
        return {
            id: rawData.ID,
            username: rawData.USERNAME,
            password_hash: rawData.PASSWORD_HASH,
            nickname: rawData.NICKNAME,
            email: rawData.EMAIL,
            phone: rawData.PHONE,
            avatar: rawData.AVATAR,
            gender: rawData.GENDER,
            birthday: rawData.BIRTHDAY,
            bio: rawData.BIO,
            level: rawData.LEVEL,
            points: rawData.POINTS,
            balance: rawData.BALANCE,
            status: rawData.STATUS,
            last_login_time: rawData.LAST_LOGIN_TIME,
            last_login_ip: rawData.LAST_LOGIN_IP,
            login_count: rawData.LOGIN_COUNT,
            remember_token: rawData.REMEMBER_TOKEN,
            email_verified: rawData.EMAIL_VERIFIED,
            phone_verified: rawData.PHONE_VERIFIED,
            agree_terms: rawData.AGREE_TERMS,
            agree_privacy: rawData.AGREE_PRIVACY,
            created_at: rawData.CREATED_AT,
            updated_at: rawData.UPDATED_AT
        };
    }
}

module.exports = UserModel;