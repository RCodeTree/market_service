const {GetDatabase: database} = require('../config/db'); // 导入自定义的达梦数据库模块

class UsersModel {
    user_id;
    username;
    age;

    constructor(user_id, username, age) {
        this.user_id = user_id;
        this.username = username;
        this.age = age;
    }

    set UserID(user_id) {
        this.user_id = user_id;
    }

    get UserID() {
        return this.user_id;
    }

    set Username(username) {
        this.username = username;
    }

    get Username() {
        return this.username;
    }

    set Age(age) {
        this.age = age;
    }

    get Age() {
        return this.age;
    }


    // 获取所有用户
    static async getAllUsers() {
        let pool, conn;
        const {pool: Pool, conn: Conn} = await database();
        pool = Pool;
        conn = Conn;

        try {
            const result = await conn.execute("select * from MARKET.UsersModel");
            console.log('获取用户列表成功:', result.rows);
            return result.rows;
        } catch (error) {
            console.error('获取用户列表失败:', error.message);
            throw error;
        } finally {
            await conn.close();
            await pool.close();
        }

    }

}

module.exports = UsersModel;