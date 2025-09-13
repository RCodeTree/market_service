const {database} = require('../config/db');
const {poolMax} = require('dmdb');

class USERS {
    user_id;
    username;
    age;

    constructor(user_id, username, age) {
        this.user_id = user_id;
        this.username = username;
        this.age = age;
    }

    // 将对象转换为数据库插入格式
    toDbObject() {
        return {
            user_id: this.user_id,
            username: this.username,
            age: this.age
        };
    }

    // 从数据库结果创建USERS实例
    static fromDbResult(dbRow) {
        return new USERS(dbRow.user_id, dbRow.username, dbRow.age);
    }

    // 获取所有用户
    static async getAllUsers() {
        try {
            const {conn} = await database();
            const result = await conn.execute("SELECT * FROM USERS");
            return result.rows || [];
        } catch (error) {
            console.error('获取用户列表失败:', error.message);
            throw error;
        }
    }

    // 验证用户数据
    validate() {
        const errors = [];
        
        if (!this.user_id || typeof this.user_id !== 'number') {
            errors.push('user_id must be a valid number');
        }
        
        if (!this.username || typeof this.username !== 'string' || this.username.length > 30) {
            errors.push('username must be a string with max length 30');
        }
        
        if (this.age !== undefined && (typeof this.age !== 'number' || this.age < 0 || this.age > 999)) {
            errors.push('age must be a number between 0 and 999');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // 转换为JSON格式
    toJSON() {
        return {
            user_id: this.user_id,
            username: this.username,
            age: this.age
        };
    }
}

module.exports = USERS;