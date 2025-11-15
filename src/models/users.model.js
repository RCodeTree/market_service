const { GetDatabase } = require('../config/db');

/**
 * 用户数据模型
 * 负责用户相关的数据库操作
 */
class UserModel {
    static toNumber(v) {
        return typeof v === 'bigint' ? Number(v) : v;
    }
    /**
     * 根据用户名查找用户
     * @param {string} username - 用户名
     * @returns {Object|null} 用户信息或null
     */
    static async findByUsername(username) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
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
            const { conn: connection } = await GetDatabase();
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
                const row = result.rows[0];
                if (Array.isArray(row)) {
                    return this.formatUserDataByIdRow(row);
                }
                return this.formatUserData(row);
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
            const { conn: connection } = await GetDatabase();
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
            const { conn: connection } = await GetDatabase();
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
            const { conn: connection } = await GetDatabase();
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
            const { conn: connection } = await GetDatabase();
            conn = connection;

            const allowedFields = ['nickname', 'email', 'phone', 'avatar', 'gender', 'birthday'];
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
            const { conn: connection } = await GetDatabase();
            conn = connection;

            const sql = 'SELECT COUNT(*) as count FROM MARKET.USERS WHERE username = ?';
            const result = await conn.execute(sql, [username]);

            const cntRaw = typeof result.rows[0].COUNT !== 'undefined' ? result.rows[0].COUNT : result.rows[0][0];
            const count = this.toNumber(cntRaw);
            return count > 0;
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
                birthday, level, points, balance, status, last_login_time,
                last_login_ip, login_count, remember_token, email_verified,
                phone_verified, agree_terms, agree_privacy, created_at, updated_at
            ] = rawData;

            return {
                id: this.toNumber(id),
                username,
                password_hash,
                nickname,
                email,
                phone,
                avatar,
                gender,
                birthday,
                level: this.toNumber(level),
                points: this.toNumber(points),
                balance: this.toNumber(balance),
                status: this.toNumber(status),
                last_login_time,
                last_login_ip,
                login_count: this.toNumber(login_count),
                remember_token,
                email_verified: this.toNumber(email_verified),
                phone_verified: this.toNumber(phone_verified),
                agree_terms: this.toNumber(agree_terms),
                agree_privacy: this.toNumber(agree_privacy),
                created_at,
                updated_at
            };
  }


        // 处理对象格式数据（兼容性保留）
        return {
            id: this.toNumber(rawData.ID),
            username: rawData.USERNAME,
            password_hash: rawData.PASSWORD_HASH,
            nickname: rawData.NICKNAME,
            email: rawData.EMAIL,
            phone: rawData.PHONE,
            avatar: rawData.AVATAR,
            gender: rawData.GENDER,
            birthday: rawData.BIRTHDAY,
            level: this.toNumber(rawData.LEVEL),
            points: this.toNumber(rawData.POINTS),
            balance: this.toNumber(rawData.BALANCE),
            status: this.toNumber(rawData.STATUS),
            last_login_time: rawData.LAST_LOGIN_TIME,
            last_login_ip: rawData.LAST_LOGIN_IP,
            login_count: this.toNumber(rawData.LOGIN_COUNT),
            remember_token: rawData.REMEMBER_TOKEN,
            email_verified: this.toNumber(rawData.EMAIL_VERIFIED),
            phone_verified: this.toNumber(rawData.PHONE_VERIFIED),
            agree_terms: this.toNumber(rawData.AGREE_TERMS),
            agree_privacy: this.toNumber(rawData.AGREE_PRIVACY),
            created_at: rawData.CREATED_AT,
            updated_at: rawData.UPDATED_AT
        };
    }

    static formatUserDataByIdRow(rawData) {
        if (!Array.isArray(rawData)) return this.formatUserData(rawData);
        const [
            id, username, nickname, email, phone, avatar, gender,
            birthday, level, points, balance, status,
            last_login_time, last_login_ip, login_count,
            email_verified, phone_verified,
            created_at, updated_at
        ] = rawData;
        return {
            id: this.toNumber(id),
            username,
            nickname,
            email,
            phone,
            avatar,
            gender,
            birthday,
            level: this.toNumber(level),
            points: this.toNumber(points),
            balance: this.toNumber(balance),
            status: this.toNumber(status),
            last_login_time,
            last_login_ip,
            login_count: this.toNumber(login_count),
            email_verified: this.toNumber(email_verified),
            phone_verified: this.toNumber(phone_verified),
            created_at,
            updated_at
        };
    }

    static async listFavorites(userId, { page = 1, pageSize = 12, sort = 'latest' } = {}) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;

            const offset = (page - 1) * pageSize;
            let orderBy = 'uf.created_at DESC';
            if (sort === 'price_asc') orderBy = 'p.price ASC';
            else if (sort === 'price_desc') orderBy = 'p.price DESC';
            else if (sort === 'rating') orderBy = 'p.rating_avg DESC';
            else orderBy = 'uf.created_at DESC';

            const countSql = 'SELECT COUNT(*) AS total FROM MARKET.USER_FAVORITES uf WHERE uf.user_id = ?';
            const countRes = await conn.execute(countSql, [userId]);
            const totalRaw = countRes.rows[0].TOTAL || countRes.rows[0][0];
            const total = this.toNumber(totalRaw);

            const listSql = `
        SELECT uf.id AS fav_id,
               uf.product_id,
               uf.created_at,
               p.name,
               p.main_image,
               p.price,
               p.original_price,
               p.rating_avg,
               p.status
        FROM MARKET.USER_FAVORITES uf
        JOIN MARKET.PRODUCTS p ON p.id = uf.product_id
        WHERE uf.user_id = ?
        ORDER BY ${orderBy}
        LIMIT ${pageSize}
        OFFSET ${offset}
      `;
            const listRes = await conn.execute(listSql, [userId]);
            const favorites = (listRes.rows || []).map(r => {
                if (Array.isArray(r)) {
                    const [fav_id, product_id, created_at, name, main_image, price, original_price, rating_avg, status] = r;
                    return {
                        id: this.toNumber(fav_id),
                        productId: this.toNumber(product_id),
                        name,
                        image: main_image,
                        currentPrice: this.toNumber(price),
                        originalPrice: this.toNumber(original_price),
                        rating: this.toNumber(rating_avg),
                        status: this.toNumber(status) === 1 ? 'available' : 'discontinued',
                        createdAt: created_at
                    };
                }
                return {
                    id: this.toNumber(r.FAV_ID),
                    productId: this.toNumber(r.PRODUCT_ID),
                    name: r.NAME,
                    image: r.MAIN_IMAGE,
                    currentPrice: this.toNumber(r.PRICE),
                    originalPrice: this.toNumber(r.ORIGINAL_PRICE),
                    rating: this.toNumber(r.RATING_AVG),
                    status: this.toNumber(r.STATUS) === 1 ? 'available' : 'discontinued',
                    createdAt: r.CREATED_AT
                };
            });
            return { favorites, total };
        } catch (error) {
            throw new Error('获取收藏列表失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async addFavorite(userId, productId) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const check = await conn.execute('SELECT id FROM MARKET.USER_FAVORITES WHERE user_id = ? AND product_id = ? FETCH FIRST 1 ROWS ONLY', [userId, productId]);
            if (check.rows && check.rows.length > 0) return { created: false };
            const id = Date.now() + Math.floor(Math.random() * 1000);
            await conn.execute('INSERT INTO MARKET.USER_FAVORITES (id, user_id, product_id, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [id, userId, productId]);
            await conn.commit();
            return { created: true, id };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('添加收藏失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async removeFavorite(userId, favoriteId) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            await conn.execute('DELETE FROM MARKET.USER_FAVORITES WHERE id = ? AND user_id = ?', [favoriteId, userId]);
            await conn.commit();
            return { deleted: true };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('移除收藏失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async batchRemoveFavorites(userId, favoriteIds = []) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) return { deleted: 0 };
            const placeholders = favoriteIds.map(() => '?').join(',');
            await conn.execute(`DELETE FROM MARKET.USER_FAVORITES WHERE user_id = ? AND id IN (${placeholders})`, [userId, ...favoriteIds]);
            await conn.commit();
            return { deleted: favoriteIds.length };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('批量移除收藏失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async getStats(userId) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const favCountRes = await conn.execute('SELECT COUNT(*) AS total FROM MARKET.USER_FAVORITES WHERE user_id = ?', [userId]);
            const favRaw = favCountRes.rows[0].TOTAL || favCountRes.rows[0][0];
            const favoriteCount = this.toNumber(favRaw);
            const orderCountRes = await conn.execute('SELECT COUNT(*) AS total FROM MARKET.ORDERS WHERE user_id = ?', [userId]);
            const ordRaw = orderCountRes.rows[0].TOTAL || orderCountRes.rows[0][0];
            const orderCount = this.toNumber(ordRaw);
            return { orderCount, favoriteCount };
        } catch (error) {
            throw new Error('获取用户统计失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static mapAddressRow(r) {
        if (Array.isArray(r)) {
            const [id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, postal_code, address_tag, is_default, status, created_at, updated_at] = r;
            return {
                id: this.toNumber(id),
                userId: this.toNumber(user_id),
                receiver_name,
                receiver_phone,
                province,
                city,
                district,
                detail_address,
                postal_code: postal_code || null,
                address_tag: address_tag || null,
                is_default: this.toNumber(is_default) === 1,
                status: this.toNumber(status),
                created_at,
                updated_at
            };
        }
        return {
            id: this.toNumber(r.ID),
            userId: this.toNumber(r.USER_ID),
            receiver_name: r.RECEIVER_NAME,
            receiver_phone: r.RECEIVER_PHONE,
            province: r.PROVINCE,
            city: r.CITY,
            district: r.DISTRICT,
            detail_address: r.DETAIL_ADDRESS,
            postal_code: r.POSTAL_CODE || null,
            address_tag: r.ADDRESS_TAG || null,
            is_default: this.toNumber(r.IS_DEFAULT) === 1,
            status: this.toNumber(r.STATUS),
            created_at: r.CREATED_AT,
            updated_at: r.UPDATED_AT
        };
    }

    static async listAddresses(userId) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const sql = `SELECT id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, postal_code, address_tag, is_default, status, created_at, updated_at FROM MARKET.USER_ADDRESSES WHERE user_id = ? AND status = 1 ORDER BY is_default DESC, updated_at DESC`;
            const res = await conn.execute(sql, [userId]);
            return (res.rows || []).map(r => this.mapAddressRow(r));
        } catch (error) {
            throw new Error('查询地址失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async createAddress(userId, data) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const sql = `INSERT INTO MARKET.USER_ADDRESSES (id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, postal_code, address_tag, is_default, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
            const isDefault = data.is_default ? 1 : 0;
            await conn.execute(sql, [id, userId, data.receiver_name, data.receiver_phone, data.province, data.city, data.district, data.detail_address, data.postal_code || null, data.address_tag || null, isDefault]);
            if (isDefault === 1) {
                await conn.execute('UPDATE MARKET.USER_ADDRESSES SET is_default = 0 WHERE user_id = ? AND id <> ?', [userId, id]);
            }
            await conn.commit();
            return { id };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('新增地址失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async updateAddress(userId, id, data) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const fields = [];
            const values = [];
            const allow = ['receiver_name', 'receiver_phone', 'province', 'city', 'district', 'detail_address', 'postal_code', 'address_tag', 'is_default'];
            for (const k of allow) {
                if (Object.prototype.hasOwnProperty.call(data, k)) {
                    fields.push(`${k} = ?`);
                    values.push(k === 'is_default' ? (data[k] ? 1 : 0) : data[k]);
                }
            }
            if (fields.length === 0) throw new Error('没有可更新的字段');
            const sql = `UPDATE MARKET.USER_ADDRESSES SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
            values.push(id, userId);
            await conn.execute(sql, values);
            if (Object.prototype.hasOwnProperty.call(data, 'is_default') && (data.is_default ? 1 : 0) === 1) {
                await conn.execute('UPDATE MARKET.USER_ADDRESSES SET is_default = 0 WHERE user_id = ? AND id <> ?', [userId, id]);
            }
            await conn.commit();
            return { updated: true };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('更新地址失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async deleteAddress(userId, id) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            await conn.execute('UPDATE MARKET.USER_ADDRESSES SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [id, userId]);
            await conn.commit();
            const check = await conn.execute('SELECT status FROM MARKET.USER_ADDRESSES WHERE id = ? AND user_id = ? FETCH FIRST 1 ROWS ONLY', [id, userId]);
            if (check.rows && check.rows.length > 0) {
                const statusRaw = typeof check.rows[0].STATUS !== 'undefined' ? check.rows[0].STATUS : check.rows[0][0];
                const status = this.toNumber(statusRaw);
                return { deleted: status === 0 };
            }
            return { deleted: true };
        } catch (error) {
            if (conn) await conn.rollback();
            throw new Error('删除地址失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async getAddress(userId, id) {
        let conn = null;
        try {
            const { conn: connection } = await GetDatabase();
            conn = connection;
            const res = await conn.execute('SELECT id, user_id, receiver_name, receiver_phone, province, city, district, detail_address, postal_code, address_tag, is_default, status, created_at, updated_at FROM MARKET.USER_ADDRESSES WHERE id = ? AND user_id = ? FETCH FIRST 1 ROWS ONLY', [id, userId]);
            if (res.rows && res.rows.length > 0) {
                return this.mapAddressRow(res.rows[0]);
            }
            return null;
        } catch (error) {
            throw new Error('查询地址失败');
        } finally {
            if (conn) await conn.close();
        }
    }
}

module.exports = UserModel;
