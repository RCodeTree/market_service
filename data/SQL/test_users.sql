

-- 测试用户数据插入脚本
SELECT * FROM MARKET.USERS;

-- 用于测试登录和注册功能


-- 插入张三用户的完整信息
-- 密码: 123456 (已加密)
INSERT INTO MARKET.USERS (
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
) VALUES (
    1001,                                                           -- id: 用户ID
    'zhangsan',                                                     -- username: 用户名
    '$2b$12$xmpwaG2WCpw1d5aJ7/60B.1VqUbIGmacGD9pezsgWJ4hUq64dh0Sm', -- password_hash: 密码哈希值 (对应密码: 123456)
    '张三',                                                          -- nickname: 昵称
    'zhangsan@example.com',                                         -- email: 邮箱
    '13800138001',                                                  -- phone: 手机号
    'https://example.com/avatars/zhangsan.jpg',                     -- avatar: 头像URL
    1,                                                              -- gender: 性别 (1-男)
    DATE '1990-05-15',                                              -- birthday: 生日
    '我是张三，一个热爱购物的用户，喜欢在京东商城购买各种商品。',              -- bio: 个人简介
    2,                                                              -- level: 用户等级 (2-VIP)
    1500,                                                           -- points: 积分
    299.50,                                                         -- balance: 账户余额
    1,                                                              -- status: 状态 (1-正常)
    TIMESTAMP '2024-01-15 10:30:00',                                -- last_login_time: 最后登录时间
    '192.168.1.100',                                                -- last_login_ip: 最后登录IP
    25,                                                             -- login_count: 登录次数
    'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',          -- remember_token: 记住我令牌
    1,                                                              -- email_verified: 邮箱已验证
    1,                                                              -- phone_verified: 手机已验证
    1,                                                              -- agree_terms: 同意用户协议
    1,                                                              -- agree_privacy: 同意隐私政策
    TIMESTAMP '2023-12-01 09:00:00',                                -- created_at: 创建时间
    TIMESTAMP '2024-01-15 10:30:00'                                 -- updated_at: 更新时间
);

-- 插入李四用户 (普通用户)
-- 密码: 654321 (已加密)
INSERT INTO MARKET.USERS (
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
) VALUES (
    1002,                                                           -- id: 用户ID
    'lisi',                                                         -- username: 用户名
    '$2b$12$/s65acJjaSqzCmFEWs3TmebEWLem.acLMUSKNbZ/8clGCB8S/sI5q', -- password_hash: 密码哈希值 (对应密码: 654321)
    '李四',                                                          -- nickname: 昵称
    'lisi@example.com',                                             -- email: 邮箱
    '13800138002',                                                  -- phone: 手机号
    'https://example.com/avatars/lisi.jpg',                         -- avatar: 头像URL
    2,                                                              -- gender: 性别 (2-女)
    DATE '1992-08-20',                                              -- birthday: 生日
    '我是李四，喜欢网购，经常在各大电商平台购买商品。',                      -- bio: 个人简介
    1,                                                              -- level: 用户等级 (1-普通)
    800,                                                            -- points: 积分
    150.00,                                                         -- balance: 账户余额
    1,                                                              -- status: 状态 (1-正常)
    TIMESTAMP '2024-01-10 14:20:00',                                -- last_login_time: 最后登录时间
    '192.168.1.101',                                                -- last_login_ip: 最后登录IP
    15,                                                             -- login_count: 登录次数
    'def456ghi789jkl012mno345pqr678stu901vwx234yz567abc',          -- remember_token: 记住我令牌
    1,                                                              -- email_verified: 邮箱已验证
    0,                                                              -- phone_verified: 手机未验证
    1,                                                              -- agree_terms: 同意用户协议
    1,                                                              -- agree_privacy: 同意隐私政策
    TIMESTAMP '2023-11-15 16:30:00',                                -- created_at: 创建时间
    TIMESTAMP '2024-01-10 14:20:00'                                 -- updated_at: 更新时间
);

-- 插入王五用户 (SVIP用户)
-- 密码: password123 (已加密)
INSERT INTO MARKET.USERS (
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
) VALUES (
    1003,                                                           -- id: 用户ID
    'wangwu',                                                       -- username: 用户名
    '$2b$12$.Wk41sp.YXlGq9BBReich.bq1vjQ3WnZdgW2yyW3.618vtvWYJ6GW', -- password_hash: 密码哈希值 (对应密码: password123)
    '王五',                                                          -- nickname: 昵称
    'wangwu@example.com',                                           -- email: 邮箱
    '13800138003',                                                  -- phone: 手机号
    'https://example.com/avatars/wangwu.jpg',                       -- avatar: 头像URL
    1,                                                              -- gender: 性别 (1-男)
    DATE '1988-03-10',                                              -- birthday: 生日
    '我是王五，资深购物达人，SVIP会员，享受各种优惠和特权。',               -- bio: 个人简介
    3,                                                              -- level: 用户等级 (3-SVIP)
    5000,                                                           -- points: 积分
    1299.99,                                                        -- balance: 账户余额
    1,                                                              -- status: 状态 (1-正常)
    TIMESTAMP '2024-01-16 09:15:00',                                -- last_login_time: 最后登录时间
    '192.168.1.102',                                                -- last_login_ip: 最后登录IP
    88,                                                             -- login_count: 登录次数
    'ghi789jkl012mno345pqr678stu901vwx234yz567abc123def',          -- remember_token: 记住我令牌
    1,                                                              -- email_verified: 邮箱已验证
    1,                                                              -- phone_verified: 手机已验证
    1,                                                              -- agree_terms: 同意用户协议
    1,                                                              -- agree_privacy: 同意隐私政策
    TIMESTAMP '2023-10-01 12:00:00',                                -- created_at: 创建时间
    TIMESTAMP '2024-01-16 09:15:00'                                 -- updated_at: 更新时间
);

-- 提交事务
COMMIT;

-- 查询验证插入的数据
SELECT id, username, nickname, email, level, status, created_at 
FROM MARKET.USERS 
WHERE id IN (1001, 1002, 1003);