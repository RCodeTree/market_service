-- ================================
-- 仿京东商城数据库表结构设计
-- 基于前端Vue3项目需求优化
-- 根据用户注册和登录界面重新设计
-- 使用逻辑外键，不使用物理外键约束
-- ================================

-- 设置模式
SET SCHEMA MARKET;

-- ================================
-- 1. 用户相关表
-- ================================

-- 用户表（简化注册：仅需用户名和密码）
CREATE TABLE users
(
    id              BIGINT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名（唯一标识）',
    password_hash   VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    nickname        VARCHAR(50) COMMENT '昵称（可选，默认为用户名）',
    email           VARCHAR(100) COMMENT '邮箱（可选，后续完善）',
    phone           VARCHAR(20) COMMENT '手机号（可选，后续完善）',
    avatar          VARCHAR(500) COMMENT '头像URL',
    gender          TINYINT        DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    birthday        DATE COMMENT '生日',
    bio             TEXT COMMENT '个人简介',
    level           TINYINT        DEFAULT 1 COMMENT '用户等级：1-普通，2-VIP，3-SVIP',
    points          INT            DEFAULT 0 COMMENT '积分',
    balance         DECIMAL(10, 2) DEFAULT 0.00 COMMENT '账户余额',
    status          TINYINT        DEFAULT 1 COMMENT '状态：0-禁用，1-正常，2-冻结',
    last_login_time TIMESTAMP COMMENT '最后登录时间',
    last_login_ip   VARCHAR(45) COMMENT '最后登录IP',
    login_count     INT            DEFAULT 0 COMMENT '登录次数',
    remember_token  VARCHAR(255) COMMENT '记住我令牌',
    email_verified  TINYINT        DEFAULT 0 COMMENT '邮箱是否验证：0-否，1-是',
    phone_verified  TINYINT        DEFAULT 0 COMMENT '手机是否验证：0-否，1-是',
    agree_terms     TINYINT        DEFAULT 1 COMMENT '是否同意用户协议：0-否，1-是',
    agree_privacy   TINYINT        DEFAULT 1 COMMENT '是否同意隐私政策：0-否，1-是',
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户登录记录表（记录登录历史）
CREATE TABLE user_login_logs
(
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT      NOT NULL COMMENT '用户ID（逻辑外键）',
    login_ip   VARCHAR(45) NOT NULL COMMENT '登录IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    device     VARCHAR(100) COMMENT '设备信息',
    location   VARCHAR(100) COMMENT '登录地点',
    is_success TINYINT     DEFAULT 1 COMMENT '是否成功：0-失败，1-成功',
    fail_reason VARCHAR(200) COMMENT '失败原因',
    created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间'
);

-- 密码重置表（忘记密码功能）
CREATE TABLE password_resets
(
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT       NOT NULL COMMENT '用户ID（逻辑外键）',
    email      VARCHAR(100) COMMENT '重置邮箱',
    phone      VARCHAR(20) COMMENT '重置手机号',
    token      VARCHAR(255) NOT NULL COMMENT '重置令牌',
    expires_at TIMESTAMP    NOT NULL COMMENT '过期时间',
    used       TINYINT      DEFAULT 0 COMMENT '是否已使用：0-否，1-是',
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 用户地址表
CREATE TABLE user_addresses
(
    id             BIGINT PRIMARY KEY,
    user_id        BIGINT       NOT NULL COMMENT '用户ID（逻辑外键）',
    receiver_name  VARCHAR(50)  NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20)  NOT NULL COMMENT '收货人电话',
    province       VARCHAR(50)  NOT NULL COMMENT '省份',
    city           VARCHAR(50)  NOT NULL COMMENT '城市',
    district       VARCHAR(50)  NOT NULL COMMENT '区县',
    detail_address VARCHAR(200) NOT NULL COMMENT '详细地址',
    postal_code    VARCHAR(10) COMMENT '邮政编码',
    address_tag    VARCHAR(20) COMMENT '地址标签：home-家，company-公司，school-学校',
    is_default     TINYINT   DEFAULT 0 COMMENT '是否默认地址：0-否，1-是',
    status         TINYINT   DEFAULT 1 COMMENT '状态：0-删除，1-正常',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户收藏表
CREATE TABLE user_favorites
(
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT NOT NULL COMMENT '用户ID（逻辑外键）',
    product_id BIGINT NOT NULL COMMENT '商品ID（逻辑外键）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 用户搜索历史表
CREATE TABLE user_search_history
(
    id           BIGINT PRIMARY KEY,
    user_id      BIGINT COMMENT '用户ID（逻辑外键），NULL表示游客',
    keyword      VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    search_count INT       DEFAULT 1 COMMENT '搜索次数',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ================================
-- 2. 商品相关表
-- ================================

-- 商品分类表（支持多级分类）
CREATE TABLE categories
(
    id              BIGINT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id       BIGINT    DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    level           TINYINT   DEFAULT 1 COMMENT '分类层级：1-一级，2-二级，3-三级',
    path            VARCHAR(500) COMMENT '分类路径，如：1,2,3',
    sort_order      INT       DEFAULT 0 COMMENT '排序',
    icon            VARCHAR(100) COMMENT '分类图标',
    image           VARCHAR(500) COMMENT '分类图片',
    banner_image    VARCHAR(500) COMMENT '分类横幅图片',
    description     TEXT COMMENT '分类描述',
    seo_title       VARCHAR(200) COMMENT 'SEO标题',
    seo_keywords    VARCHAR(500) COMMENT 'SEO关键词',
    seo_description VARCHAR(500) COMMENT 'SEO描述',
    is_hot          TINYINT   DEFAULT 0 COMMENT '是否热门分类：0-否，1-是',
    is_recommend    TINYINT   DEFAULT 0 COMMENT '是否推荐分类：0-否，1-是',
    status          TINYINT   DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 品牌表
CREATE TABLE brands
(
    id           BIGINT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL COMMENT '品牌名称',
    english_name VARCHAR(100) COMMENT '品牌英文名',
    logo         VARCHAR(500) COMMENT '品牌Logo',
    description  TEXT COMMENT '品牌描述',
    story        TEXT COMMENT '品牌故事',
    website      VARCHAR(200) COMMENT '官方网站',
    country      VARCHAR(50) COMMENT '品牌国家',
    founded_year INT COMMENT '成立年份',
    sort_order   INT       DEFAULT 0 COMMENT '排序',
    is_hot       TINYINT   DEFAULT 0 COMMENT '是否热门品牌：0-否，1-是',
    status       TINYINT   DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 商品表
CREATE TABLE products
(
    id                   BIGINT PRIMARY KEY,
    name                 VARCHAR(200)   NOT NULL COMMENT '商品名称',
    subtitle             VARCHAR(500) COMMENT '商品副标题',
    category_id          BIGINT         NOT NULL COMMENT '分类ID（逻辑外键）',
    brand_id             BIGINT COMMENT '品牌ID（逻辑外键）',
    sku                  VARCHAR(100)   NOT NULL UNIQUE COMMENT '商品SKU',
    barcode              VARCHAR(50) COMMENT '商品条码',
    price                DECIMAL(10, 2) NOT NULL COMMENT '现价',
    original_price       DECIMAL(10, 2) COMMENT '原价',
    cost_price           DECIMAL(10, 2) COMMENT '成本价',
    stock                INT           DEFAULT 0 COMMENT '库存数量',
    min_stock            INT           DEFAULT 0 COMMENT '最低库存预警',
    sales_count          INT           DEFAULT 0 COMMENT '销量',
    view_count           INT           DEFAULT 0 COMMENT '浏览量',
    favorite_count       INT           DEFAULT 0 COMMENT '收藏数',
    review_count         INT           DEFAULT 0 COMMENT '评价数',
    rating_avg           DECIMAL(3, 2) DEFAULT 0.00 COMMENT '平均评分',
    weight               DECIMAL(8, 2) COMMENT '重量(kg)',
    volume               DECIMAL(8, 2) COMMENT '体积(立方米)',
    unit                 VARCHAR(20)   DEFAULT '件' COMMENT '单位',
    main_image           VARCHAR(500) COMMENT '主图',
    video_url            VARCHAR(500) COMMENT '商品视频',
    description          TEXT COMMENT '商品简介',
    detail_html          TEXT COMMENT '详情页HTML',
    detail_mobile_html   TEXT COMMENT '移动端详情页HTML',
    keywords             VARCHAR(500) COMMENT '关键词',
    tags                 VARCHAR(500) COMMENT '标签，逗号分隔',
    attributes           JSON COMMENT '商品属性JSON',
    shipping_template_id BIGINT COMMENT '运费模板ID（逻辑外键）',
    service_guarantee    VARCHAR(500) COMMENT '服务保障',
    is_virtual           TINYINT       DEFAULT 0 COMMENT '是否虚拟商品：0-否，1-是',
    is_hot               TINYINT       DEFAULT 0 COMMENT '是否热门：0-否，1-是',
    is_new               TINYINT       DEFAULT 0 COMMENT '是否新品：0-否，1-是',
    is_recommend         TINYINT       DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
    is_limited           TINYINT       DEFAULT 0 COMMENT '是否限量：0-否，1-是',
    status               TINYINT       DEFAULT 1 COMMENT '状态：0-下架，1-上架，2-预售',
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 商品图片表
CREATE TABLE product_images
(
    id         BIGINT PRIMARY KEY,
    product_id BIGINT       NOT NULL COMMENT '商品ID（逻辑外键）',
    image_url  VARCHAR(500) NOT NULL COMMENT '图片URL',
    alt_text   VARCHAR(200) COMMENT '图片描述',
    sort_order INT       DEFAULT 0 COMMENT '排序',
    is_main    TINYINT   DEFAULT 0 COMMENT '是否主图：0-否，1-是',
    image_type TINYINT   DEFAULT 1 COMMENT '图片类型：1-商品图，2-详情图',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 商品规格表（SKU）
CREATE TABLE product_skus
(
    id             BIGINT PRIMARY KEY,
    product_id     BIGINT         NOT NULL COMMENT '商品ID（逻辑外键）',
    sku_code       VARCHAR(100)   NOT NULL UNIQUE COMMENT 'SKU编码',
    spec_values    VARCHAR(500) COMMENT '规格值组合，如：红色,XL',
    price          DECIMAL(10, 2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10, 2) COMMENT '原价',
    cost_price     DECIMAL(10, 2) COMMENT '成本价',
    stock          INT       DEFAULT 0 COMMENT '库存',
    weight         DECIMAL(8, 2) COMMENT '重量',
    image          VARCHAR(500) COMMENT 'SKU图片',
    barcode        VARCHAR(50) COMMENT 'SKU条码',
    status         TINYINT   DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 商品规格名表
CREATE TABLE product_spec_names
(
    id         BIGINT PRIMARY KEY,
    product_id BIGINT      NOT NULL COMMENT '商品ID（逻辑外键）',
    spec_name  VARCHAR(50) NOT NULL COMMENT '规格名称，如：颜色、尺寸',
    sort_order INT       DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 商品规格值表
CREATE TABLE product_spec_values
(
    id           BIGINT PRIMARY KEY,
    spec_name_id BIGINT       NOT NULL COMMENT '规格名ID（逻辑外键）',
    spec_value   VARCHAR(100) NOT NULL COMMENT '规格值，如：红色、XL',
    image        VARCHAR(500) COMMENT '规格值图片',
    sort_order   INT       DEFAULT 0 COMMENT '排序',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ================================
-- 3. 购物车相关表
-- ================================

-- 购物车表
CREATE TABLE cart_items
(
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT         NOT NULL COMMENT '用户ID（逻辑外键）',
    product_id BIGINT         NOT NULL COMMENT '商品ID（逻辑外键）',
    sku_id     BIGINT COMMENT 'SKU ID（逻辑外键）',
    quantity   INT            NOT NULL DEFAULT 1 COMMENT '数量',
    price      DECIMAL(10, 2) NOT NULL COMMENT '加入购物车时的价格',
    selected   TINYINT                 DEFAULT 1 COMMENT '是否选中：0-否，1-是',
    created_at TIMESTAMP               DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP               DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- ================================
-- 4. 订单相关表
-- ================================

-- 订单表
CREATE TABLE orders
(
    id                   BIGINT PRIMARY KEY,
    order_no             VARCHAR(50)    NOT NULL UNIQUE COMMENT '订单号',
    user_id              BIGINT         NOT NULL COMMENT '用户ID（逻辑外键）',
    order_type           TINYINT                 DEFAULT 1 COMMENT '订单类型：1-普通订单，2-预售订单，3-团购订单',
    status               VARCHAR(20)    NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending-待付款，paid-待发货，shipped-待收货，delivered-待评价，completed-已完成，cancelled-已取消，refunding-退款中，refunded-已退款',
    total_amount         DECIMAL(10, 2) NOT NULL COMMENT '订单总金额',
    product_amount       DECIMAL(10, 2) NOT NULL COMMENT '商品金额',
    shipping_amount      DECIMAL(10, 2)          DEFAULT 0 COMMENT '运费',
    discount_amount      DECIMAL(10, 2)          DEFAULT 0 COMMENT '优惠金额',
    coupon_amount        DECIMAL(10, 2)          DEFAULT 0 COMMENT '优惠券金额',
    points_amount        DECIMAL(10, 2)          DEFAULT 0 COMMENT '积分抵扣金额',
    actual_amount        DECIMAL(10, 2) NOT NULL COMMENT '实付金额',
    payment_method       VARCHAR(20) COMMENT '支付方式：alipay-支付宝，wechat-微信，unionpay-银联，balance-余额',
    payment_time         TIMESTAMP COMMENT '支付时间',
    payment_no           VARCHAR(100) COMMENT '支付流水号',
    shipping_time        TIMESTAMP COMMENT '发货时间',
    delivery_time        TIMESTAMP COMMENT '收货时间',
    auto_confirm_time    TIMESTAMP COMMENT '自动确认收货时间',
    receiver_name        VARCHAR(50)    NOT NULL COMMENT '收货人姓名',
    receiver_phone       VARCHAR(20)    NOT NULL COMMENT '收货人电话',
    receiver_province    VARCHAR(50)    NOT NULL COMMENT '收货省份',
    receiver_city        VARCHAR(50)    NOT NULL COMMENT '收货城市',
    receiver_district    VARCHAR(50)    NOT NULL COMMENT '收货区县',
    receiver_address     VARCHAR(500)   NOT NULL COMMENT '收货详细地址',
    receiver_postal_code VARCHAR(10) COMMENT '收货邮编',
    logistics_company    VARCHAR(50) COMMENT '物流公司',
    logistics_no         VARCHAR(100) COMMENT '物流单号',
    buyer_message        TEXT COMMENT '买家留言',
    seller_message       TEXT COMMENT '卖家备注',
    cancel_reason        VARCHAR(200) COMMENT '取消原因',
    refund_reason        VARCHAR(200) COMMENT '退款原因',
    refund_amount        DECIMAL(10, 2)          DEFAULT 0 COMMENT '退款金额',
    refund_time          TIMESTAMP COMMENT '退款时间',
    invoice_type         TINYINT                 DEFAULT 0 COMMENT '发票类型：0-不开票，1-个人，2-企业',
    invoice_title        VARCHAR(200) COMMENT '发票抬头',
    invoice_content      VARCHAR(200) COMMENT '发票内容',
    created_at           TIMESTAMP               DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at           TIMESTAMP               DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 订单商品表
CREATE TABLE order_items
(
    id              BIGINT PRIMARY KEY,
    order_id        BIGINT         NOT NULL COMMENT '订单ID（逻辑外键）',
    product_id      BIGINT         NOT NULL COMMENT '商品ID（逻辑外键）',
    sku_id          BIGINT COMMENT 'SKU ID（逻辑外键）',
    product_name    VARCHAR(200)   NOT NULL COMMENT '商品名称',
    product_image   VARCHAR(500) COMMENT '商品图片',
    product_sku     VARCHAR(200) COMMENT '商品SKU',
    spec_info       VARCHAR(200) COMMENT '规格信息',
    price           DECIMAL(10, 2) NOT NULL COMMENT '商品单价',
    quantity        INT            NOT NULL COMMENT '购买数量',
    total_amount    DECIMAL(10, 2) NOT NULL COMMENT '小计金额',
    refund_status   TINYINT        DEFAULT 0 COMMENT '退款状态：0-无退款，1-退款中，2-已退款',
    refund_quantity INT            DEFAULT 0 COMMENT '退款数量',
    refund_amount   DECIMAL(10, 2) DEFAULT 0 COMMENT '退款金额',
    is_reviewed     TINYINT        DEFAULT 0 COMMENT '是否已评价：0-否，1-是',
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 订单状态变更记录表
CREATE TABLE order_status_logs
(
    id            BIGINT PRIMARY KEY,
    order_id      BIGINT      NOT NULL COMMENT '订单ID（逻辑外键）',
    from_status   VARCHAR(20) COMMENT '原状态',
    to_status     VARCHAR(20) NOT NULL COMMENT '新状态',
    operator_type TINYINT   DEFAULT 1 COMMENT '操作者类型：1-用户，2-系统，3-管理员',
    operator_id   BIGINT COMMENT '操作者ID',
    remark        VARCHAR(500) COMMENT '备注',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ================================
-- 5. 评价相关表
-- ================================

-- 商品评价表
CREATE TABLE product_reviews
(
    id                 BIGINT PRIMARY KEY,
    product_id         BIGINT  NOT NULL COMMENT '商品ID（逻辑外键）',
    user_id            BIGINT  NOT NULL COMMENT '用户ID（逻辑外键）',
    order_id           BIGINT  NOT NULL COMMENT '订单ID（逻辑外键）',
    order_item_id      BIGINT  NOT NULL COMMENT '订单商品ID（逻辑外键）',
    sku_id             BIGINT COMMENT 'SKU ID（逻辑外键）',
    rating             TINYINT NOT NULL COMMENT '评分：1-5星',
    content            TEXT COMMENT '评价内容',
    images             VARCHAR(2000) COMMENT '评价图片，多个用逗号分隔',
    video_url          VARCHAR(500) COMMENT '评价视频',
    is_anonymous       TINYINT   DEFAULT 0 COMMENT '是否匿名：0-否，1-是',
    is_additional      TINYINT   DEFAULT 0 COMMENT '是否追评：0-否，1-是',
    additional_content TEXT COMMENT '追评内容',
    additional_images  VARCHAR(2000) COMMENT '追评图片',
    additional_time    TIMESTAMP COMMENT '追评时间',
    reply_content      TEXT COMMENT '商家回复',
    reply_time         TIMESTAMP COMMENT '回复时间',
    helpful_count      INT       DEFAULT 0 COMMENT '有用数',
    status             TINYINT   DEFAULT 1 COMMENT '状态：0-隐藏，1-显示，2-待审核',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 评价点赞表
CREATE TABLE review_likes
(
    id         BIGINT PRIMARY KEY,
    review_id  BIGINT NOT NULL COMMENT '评价ID（逻辑外键）',
    user_id    BIGINT NOT NULL COMMENT '用户ID（逻辑外键）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ================================
-- 6. 营销相关表
-- ================================

-- 轮播图表
CREATE TABLE banners
(
    id           BIGINT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL COMMENT '标题',
    image        VARCHAR(500) NOT NULL COMMENT '图片URL',
    mobile_image VARCHAR(500) COMMENT '移动端图片URL',
    link_url     VARCHAR(500) COMMENT '跳转链接',
    link_type    TINYINT     DEFAULT 1 COMMENT '链接类型：1-商品，2-分类，3-外部链接，4-活动页',
    target_id    BIGINT COMMENT '目标ID（商品ID或分类ID）',
    position     VARCHAR(20) DEFAULT 'home' COMMENT '展示位置：home-首页，category-分类页，product-商品页',
    device_type  TINYINT     DEFAULT 0 COMMENT '设备类型：0-全部，1-PC，2-移动端',
    sort_order   INT         DEFAULT 0 COMMENT '排序',
    start_time   TIMESTAMP COMMENT '开始时间',
    end_time     TIMESTAMP COMMENT '结束时间',
    click_count  INT         DEFAULT 0 COMMENT '点击次数',
    status       TINYINT     DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 优惠券表
CREATE TABLE coupons
(
    id                    BIGINT PRIMARY KEY,
    name                  VARCHAR(200)   NOT NULL COMMENT '优惠券名称',
    type                  TINYINT        NOT NULL COMMENT '类型：1-满减券，2-折扣券，3-免邮券',
    discount_type         TINYINT        NOT NULL COMMENT '优惠类型：1-固定金额，2-百分比',
    discount_value        DECIMAL(10, 2) NOT NULL COMMENT '优惠值',
    min_amount            DECIMAL(10, 2) DEFAULT 0 COMMENT '最低消费金额',
    max_discount          DECIMAL(10, 2) COMMENT '最大优惠金额（折扣券用）',
    total_quantity        INT            NOT NULL COMMENT '发放总数',
    used_quantity         INT            DEFAULT 0 COMMENT '已使用数量',
    per_user_limit        INT            DEFAULT 1 COMMENT '每人限领数量',
    valid_days            INT COMMENT '有效天数（从领取日算起）',
    start_time            TIMESTAMP COMMENT '使用开始时间',
    end_time              TIMESTAMP COMMENT '使用结束时间',
    applicable_products   TEXT COMMENT '适用商品ID，逗号分隔',
    applicable_categories TEXT COMMENT '适用分类ID，逗号分隔',
    description           TEXT COMMENT '使用说明',
    status                TINYINT        DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户优惠券表
CREATE TABLE user_coupons
(
    id         BIGINT PRIMARY KEY,
    user_id    BIGINT    NOT NULL COMMENT '用户ID（逻辑外键）',
    coupon_id  BIGINT    NOT NULL COMMENT '优惠券ID（逻辑外键）',
    status     TINYINT   DEFAULT 0 COMMENT '状态：0-未使用，1-已使用，2-已过期',
    used_time  TIMESTAMP COMMENT '使用时间',
    order_id   BIGINT COMMENT '使用订单ID（逻辑外键）',
    expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间'
);

-- ================================
-- 7. 系统支持表
-- ================================

-- 系统配置表
CREATE TABLE system_configs
(
    id          BIGINT PRIMARY KEY,
    config_key  VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(500) COMMENT '配置描述',
    type        VARCHAR(20) DEFAULT 'string' COMMENT '数据类型：string,number,boolean,json',
    is_public   TINYINT     DEFAULT 0 COMMENT '是否公开：0-否，1-是',
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 操作日志表
CREATE TABLE operation_logs
(
    id            BIGINT PRIMARY KEY,
    user_id       BIGINT COMMENT '操作用户ID（逻辑外键）',
    module        VARCHAR(50)  NOT NULL COMMENT '操作模块',
    action        VARCHAR(50)  NOT NULL COMMENT '操作动作',
    description   VARCHAR(500) COMMENT '操作描述',
    request_url   VARCHAR(500) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    response_data TEXT COMMENT '响应数据',
    ip_address    VARCHAR(45) COMMENT 'IP地址',
    user_agent    VARCHAR(500) COMMENT '用户代理',
    execution_time INT COMMENT '执行时间（毫秒）',
    status        TINYINT     DEFAULT 1 COMMENT '状态：0-失败，1-成功',
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- ================================
-- 8. 索引创建
-- ================================

-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 用户登录记录索引
CREATE INDEX idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX idx_user_login_logs_created_at ON user_login_logs(created_at);

-- 密码重置表索引
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

-- 用户地址表索引
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);

-- 用户收藏表索引
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON user_favorites(product_id);
CREATE UNIQUE INDEX idx_user_favorites_unique ON user_favorites(user_id, product_id);

-- 商品分类表索引
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_status ON categories(status);

-- 商品表索引
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sales_count ON products(sales_count);
CREATE INDEX idx_products_created_at ON products(created_at);

-- 商品图片表索引
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_main ON product_images(is_main);

-- 商品SKU表索引
CREATE INDEX idx_product_skus_product_id ON product_skus(product_id);
CREATE INDEX idx_product_skus_sku_code ON product_skus(sku_code);

-- 购物车表索引
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE UNIQUE INDEX idx_cart_items_unique ON cart_items(user_id, product_id, sku_id);

-- 订单表索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 订单商品表索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 商品评价表索引
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_order_id ON product_reviews(order_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at);

-- 轮播图表索引
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_sort_order ON banners(sort_order);

-- 优惠券表索引
CREATE INDEX idx_coupons_type ON coupons(type);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_start_time ON coupons(start_time);
CREATE INDEX idx_coupons_end_time ON coupons(end_time);

-- 用户优惠券表索引
CREATE INDEX idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX idx_user_coupons_coupon_id ON user_coupons(coupon_id);
CREATE INDEX idx_user_coupons_status ON user_coupons(status);
CREATE INDEX idx_user_coupons_expires_at ON user_coupons(expires_at);

-- 系统配置表索引
CREATE INDEX idx_system_configs_config_key ON system_configs(config_key);
CREATE INDEX idx_system_configs_is_public ON system_configs(is_public);

-- 操作日志表索引
CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);

-- ================================
-- 9. 初始化数据
-- ================================

-- 插入系统配置数据
INSERT INTO system_configs (id, config_key, config_value, description, type, is_public) VALUES
(1, 'site_name', '宁北商城', '网站名称', 'string', 1),
(2, 'site_logo', '/images/logo.png', '网站Logo', 'string', 1),
(3, 'site_description', '专业的电商购物平台', '网站描述', 'string', 1),
(4, 'user_default_avatar', '/images/default-avatar.png', '用户默认头像', 'string', 1),
(5, 'password_min_length', '6', '密码最小长度', 'number', 1),
(6, 'remember_me_days', '30', '记住我功能天数', 'number', 0),
(7, 'password_reset_expires', '24', '密码重置链接有效期（小时）', 'number', 0),
(8, 'auto_confirm_days', '7', '订单自动确认收货天数', 'number', 1),
(9, 'review_days_limit', '30', '评价时限（天）', 'number', 1),
(10, 'shipping_free_amount', '99', '免邮金额', 'number', 1);

-- 插入默认分类数据
INSERT INTO categories (id, name, parent_id, level, path, sort_order, status) VALUES
(1, '手机数码', 0, 1, '1', 1, 1),
(2, '电脑办公', 0, 1, '2', 2, 1),
(3, '家用电器', 0, 1, '3', 3, 1),
(4, '服饰内衣', 0, 1, '4', 4, 1),
(5, '家居家装', 0, 1, '5', 5, 1),
(6, '母婴用品', 0, 1, '6', 6, 1),
(7, '食品饮料', 0, 1, '7', 7, 1),
(8, '美妆个护', 0, 1, '8', 8, 1),
(9, '运动户外', 0, 1, '9', 9, 1),
(10, '汽车用品', 0, 1, '10', 10, 1);

-- 插入二级分类数据（手机数码）
INSERT INTO categories (id, name, parent_id, level, path, sort_order, status) VALUES
(11, '手机通讯', 1, 2, '1,11', 1, 1),
(12, '数码配件', 1, 2, '1,12', 2, 1),
(13, '智能设备', 1, 2, '1,13', 3, 1);

-- 插入品牌数据
INSERT INTO brands (id, name, english_name, logo, description, country, sort_order, is_hot, status) VALUES
(1, '苹果', 'Apple', '/images/brands/apple.png', '创新科技品牌', '美国', 1, 1, 1),
(2, '华为', 'HUAWEI', '/images/brands/huawei.png', '全球领先的ICT基础设施和智能终端提供商', '中国', 2, 1, 1),
(3, '小米', 'Xiaomi', '/images/brands/xiaomi.png', '专注于高端智能手机、互联网电视以及智能家居生态链建设的创新型科技企业', '中国', 3, 1, 1),
(4, '三星', 'Samsung', '/images/brands/samsung.png', '韩国最大的跨国企业集团', '韩国', 4, 1, 1),
(5, 'OPPO', 'OPPO', '/images/brands/oppo.png', '专注于手机拍照的品牌', '中国', 5, 1, 1);

COMMIT;