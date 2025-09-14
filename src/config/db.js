const DM8 = require('dmdb'); // 导入达梦数据库模块


/*
    获取数据库连接池
*/
const GetPool = async () => {
    try {
        const connectStr = "dm://SYSDBA:SYSDBA@localhost:5236?autoCommit=false&loginEncrypt=false";
        const pool = await DM8.createPool({
            connectString: connectStr,
            user: 'SYSDBA',
            password: 'WKRwks20041104.',
            poolMax: 100, // 设置数据库连接池的最大连接数
            poolTimeout: 60000, // 设置数据库连接池的连接超时时间
            queueMax: 10, // 设置数据库连接池的等待队列最大长度
        }); // 创建数据库连接池

        return pool;
    } catch (error) {
        throw new Error(`创建数据库连接池出现异常: ${error.message}`)
    }
}

const GetDatabase = async () => {
    try {
        const pool = await GetPool();
        const conn = await pool.getConnection(); // 获取数据库连接
        console.log('数据库连接成功');
        return {pool, conn};
    } catch (error) {
        throw new Error(`创建数据库连接出现异常: ${error.message}`)
    }
}


module.exports = {
    GetDatabase
}