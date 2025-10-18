const bcrypt = require('bcryptjs');

/**
 * 生成密码哈希值的工具脚本
 * 用于为测试用户生成正确的密码哈希值
 */

async function generatePasswordHashes() {
    const passwords = [
        { username: 'zhangsan', password: '123456' },
        { username: 'lisi', password: '654321' },
        { username: 'wangwu', password: 'password123' }
    ];

    console.log('正在生成密码哈希值...\n');

    for (const user of passwords) {
        try {
            const saltRounds = 12;
            const hash = await bcrypt.hash(user.password, saltRounds);
            
            console.log(`用户: ${user.username}`);
            console.log(`原密码: ${user.password}`);
            console.log(`哈希值: ${hash}`);
            console.log('---');
            
            // 验证哈希值是否正确
            const isValid = await bcrypt.compare(user.password, hash);
            console.log(`验证结果: ${isValid ? '✓ 正确' : '✗ 错误'}`);
            console.log('='.repeat(50));
        } catch (error) {
            console.error(`生成 ${user.username} 的密码哈希失败:`, error);
        }
    }
}

// 运行脚本
generatePasswordHashes().catch(console.error);