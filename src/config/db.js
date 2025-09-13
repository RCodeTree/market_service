const DM8 = require('dmdb'); // 导入达梦数据库模块
var pool, conn;


const database = async () => {
    try {
        pool = await DM8.createPool('dm://SYSDBA:SYSDBA@localhost:5236?autoCommit=false&loginEncrypt=false'); // 创建数据库连接池
        conn = await pool.getConnection(); // 获取数据库连接
        return {pool, conn};
    } catch (error) {
        throw new Error(`创建数据库连接出现异常: ${error.message}`)
    }
}


module.exports = {
    database
}