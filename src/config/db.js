const DM8 = require('dmdb'); // 导入达梦数据库模块


/*
    获取数据库连接池
*/
const GetPool = async () => {
    try {
        const connectStr = "dm://SYSDBA:SYSDBA@localhost:5236?autoCommit=false&loginEncrypt=false&password=WKRwks20041104.";
        // 创建数据库连接池
        return await DM8.createPool({
            connectString: connectStr,
            poolMax: 10, // 设置数据库连接池的最大连接数
            poolMin: 1, // 设置数据库连接池的最小连接数
            poolTimeout: 1000, // 设置数据库连接池的连接超时时间
            queueMax: 2 // 设置数据库连接池的等待队列最大长度
        });
    } catch (error) {
        throw new Error(`创建数据库连接池出现异常: ${error.message}`)
    }
}

const GetDatabase = async () => {
    try {
        const pool = await GetPool();
        const conn = await pool.getConnection(); // 获取数据库连接
        return {pool, conn};
    } catch (error) {
        throw new Error(`创建数据库连接出现异常: ${error.message}`)
    }
}


module.exports = {
    GetDatabase
}