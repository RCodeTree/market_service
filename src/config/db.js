const DM8 = require('dmdb'); // 导入达梦数据库模块


/*
    获取数据库连接池
*/
const GetPool = async () => {
    const pool = await DM8.createPool('dm://SYSDBA:SYSDBA@localhost:5236?autoCommit=false&loginEncrypt=false'); // 创建数据库连接池
    pool.poolMax = 100; // 设置数据库连接池的最大连接数
    pool.poolTimeout = 60000; // 设置数据库连接池的连接超时时间
    pool.queueMax = 10; // 设置数据库连接池的等待队列最大长度
    return pool;
}

const Database = async () => {
    try {
        const pool = await GetPool();
        const conn = await pool.getConnection(); // 获取数据库连接
        console.log('数据库连接成功');
        return { pool, conn };
    } catch (error) {
        throw new Error(`创建数据库连接出现异常: ${error.message}`)
    }
}


module.exports = {
    Database
}