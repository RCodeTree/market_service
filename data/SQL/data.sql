-- 仿京东商城数据库设计
-- 设置模式
set schema MARKET;

-- ================================
-- 1. 用户相关表
-- ================================

-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(500) COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    birthday DATE COMMENT '生日',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    last_login_time TIMESTAMP COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户地址表
CREATE TABLE user_addresses (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    province VARCHAR(50) NOT NULL COMMENT '省份',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    district VARCHAR(50) NOT NULL COMMENT '区县',
    detail_address VARCHAR(200) NOT NULL COMMENT '详细地址',
    postal_code VARCHAR(10) COMMENT '邮政编码',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认地址：0-否，1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 用户收藏表
CREATE TABLE user_favorites (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_product (user_id, product_id)
);

-- ================================
-- 2. 商品相关表
-- ================================

-- 商品分类表
CREATE TABLE categories (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    level TINYINT DEFAULT 1 COMMENT '分类层级',
    sort_order INT DEFAULT 0 COMMENT '排序',
    icon VARCHAR(100) COMMENT '分类图标',
    image VARCHAR(500) COMMENT '分类图片',
    description TEXT COMMENT '分类描述',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 品牌表
CREATE TABLE brands (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '品牌名称',
    logo VARCHAR(500) COMMENT '品牌Logo',
    description TEXT COMMENT '品牌描述',
    website VARCHAR(200) COMMENT '官方网站',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 商品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    subtitle VARCHAR(500) COMMENT '商品副标题',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    brand_id BIGINT COMMENT '品牌ID',
    sku VARCHAR(100) NOT NULL UNIQUE COMMENT '商品SKU',
    price DECIMAL(10,2) NOT NULL COMMENT '现价',
    original_price DECIMAL(10,2) COMMENT '原价',
    cost_price DECIMAL(10,2) COMMENT '成本价',
    stock INT DEFAULT 0 COMMENT '库存数量',
    sales_count INT DEFAULT 0 COMMENT '销量',
    view_count INT DEFAULT 0 COMMENT '浏览量',
    weight DECIMAL(8,2) COMMENT '重量(kg)',
    unit VARCHAR(20) DEFAULT '件' COMMENT '单位',
    main_image VARCHAR(500) COMMENT '主图',
    description TEXT COMMENT '商品描述',
    detail_html LONGTEXT COMMENT '详情页HTML',
    keywords VARCHAR(500) COMMENT '关键词',
    is_hot TINYINT DEFAULT 0 COMMENT '是否热门：0-否，1-是',
    is_new TINYINT DEFAULT 0 COMMENT '是否新品：0-否，1-是',
    is_recommend TINYINT DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- 商品图片表
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    alt_text VARCHAR(200) COMMENT '图片描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_main TINYINT DEFAULT 0 COMMENT '是否主图：0-否，1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 商品规格表
CREATE TABLE product_specs (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    spec_name VARCHAR(50) NOT NULL COMMENT '规格名称（如：颜色、尺寸）',
    spec_value VARCHAR(100) NOT NULL COMMENT '规格值（如：红色、XL）',
    price_diff DECIMAL(10,2) DEFAULT 0 COMMENT '价格差异',
    stock INT DEFAULT 0 COMMENT '库存',
    sku VARCHAR(100) COMMENT '规格SKU',
    image VARCHAR(500) COMMENT '规格图片',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ================================
-- 3. 购物车相关表
-- ================================

-- 购物车表
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    spec_id BIGINT COMMENT '规格ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    price DECIMAL(10,2) NOT NULL COMMENT '加入购物车时的价格',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (spec_id) REFERENCES product_specs(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_product_spec (user_id, product_id, spec_id)
);

-- ================================
-- 4. 订单相关表
-- ================================

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending-待付款，paid-待发货，shipped-待收货，delivered-待评价，completed-已完成，cancelled-已取消',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    product_amount DECIMAL(10,2) NOT NULL COMMENT '商品金额',
    shipping_amount DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    payment_method VARCHAR(20) COMMENT '支付方式：alipay-支付宝，wechat-微信，unionpay-银联，balance-余额',
    payment_time TIMESTAMP COMMENT '支付时间',
    payment_no VARCHAR(100) COMMENT '支付流水号',
    shipping_time TIMESTAMP COMMENT '发货时间',
    delivery_time TIMESTAMP COMMENT '收货时间',
    receiver_name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
    receiver_phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
    receiver_address VARCHAR(500) NOT NULL COMMENT '收货地址',
    remark TEXT COMMENT '订单备注',
    cancel_reason VARCHAR(200) COMMENT '取消原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 订单商品表
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    spec_id BIGINT COMMENT '规格ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_image VARCHAR(500) COMMENT '商品图片',
    spec_info VARCHAR(200) COMMENT '规格信息',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity INT NOT NULL COMMENT '购买数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '小计金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (spec_id) REFERENCES product_specs(id) ON DELETE SET NULL
);

-- ================================
-- 5. 评价相关表
-- ================================

-- 商品评价表
CREATE TABLE product_reviews (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL COMMENT '商品ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    order_item_id BIGINT NOT NULL COMMENT '订单商品ID',
    rating TINYINT NOT NULL COMMENT '评分：1-5星',
    content TEXT COMMENT '评价内容',
    images VARCHAR(2000) COMMENT '评价图片，多个用逗号分隔',
    is_anonymous TINYINT DEFAULT 0 COMMENT '是否匿名：0-否，1-是',
    reply_content TEXT COMMENT '商家回复',
    reply_time TIMESTAMP COMMENT '回复时间',
    helpful_count INT DEFAULT 0 COMMENT '有用数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-隐藏，1-显示',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id),
    UNIQUE KEY uk_order_item_review (order_item_id)
);

-- 评价点赞表
CREATE TABLE review_likes (
    id BIGINT PRIMARY KEY,
    review_id BIGINT NOT NULL COMMENT '评价ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_review_user (review_id, user_id)
);

-- ================================
-- 6. 系统辅助表
-- ================================

-- 轮播图表
CREATE TABLE banners (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '标题',
    image VARCHAR(500) NOT NULL COMMENT '图片URL',
    link_url VARCHAR(500) COMMENT '跳转链接',
    link_type TINYINT DEFAULT 1 COMMENT '链接类型：1-商品，2-分类，3-外部链接',
    target_id BIGINT COMMENT '目标ID（商品ID或分类ID）',
    position VARCHAR(20) DEFAULT 'home' COMMENT '展示位置：home-首页，category-分类页',
    sort_order INT DEFAULT 0 COMMENT '排序',
    start_time TIMESTAMP COMMENT '开始时间',
    end_time TIMESTAMP COMMENT '结束时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 搜索记录表
CREATE TABLE search_records (
    id BIGINT PRIMARY KEY,
    user_id BIGINT COMMENT '用户ID，NULL表示游客',
    keyword VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    result_count INT DEFAULT 0 COMMENT '搜索结果数量',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 热门搜索表
CREATE TABLE hot_searches (
    id BIGINT PRIMARY KEY,
    keyword VARCHAR(200) NOT NULL UNIQUE COMMENT '搜索关键词',
    search_count INT DEFAULT 1 COMMENT '搜索次数',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 系统配置表
CREATE TABLE system_configs (
    id BIGINT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_desc VARCHAR(200) COMMENT '配置描述',
    config_type VARCHAR(20) DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔值，json-JSON',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开：0-否，1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 管理员表
CREATE TABLE admins (
    id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    real_name VARCHAR(50) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(500) COMMENT '头像',
    role VARCHAR(20) DEFAULT 'admin' COMMENT '角色：super-超级管理员，admin-管理员，operator-操作员',
    permissions TEXT COMMENT '权限列表，JSON格式',
    last_login_time TIMESTAMP COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 操作日志表
CREATE TABLE operation_logs (
    id BIGINT PRIMARY KEY,
    admin_id BIGINT COMMENT '管理员ID',
    module VARCHAR(50) COMMENT '操作模块',
    action VARCHAR(50) COMMENT '操作动作',
    description VARCHAR(500) COMMENT '操作描述',
    request_url VARCHAR(500) COMMENT '请求URL',
    request_method VARCHAR(10) COMMENT '请求方法',
    request_params TEXT COMMENT '请求参数',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- ================================
-- 7. 创建索引优化查询性能
-- ================================

-- 用户表索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 用户地址表索引
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default);

-- 用户收藏表索引
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON user_favorites(product_id);

-- 商品分类表索引
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- 品牌表索引
CREATE INDEX idx_brands_status ON brands(status);

-- 商品表索引
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sales_count ON products(sales_count);
CREATE INDEX idx_products_view_count ON products(view_count);
CREATE INDEX idx_products_hot ON products(is_hot);
CREATE INDEX idx_products_new ON products(is_new);
CREATE INDEX idx_products_recommend ON products(is_recommend);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_keywords ON products(keywords);

-- 商品图片表索引
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_main ON product_images(product_id, is_main);

-- 商品规格表索引
CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX idx_product_specs_status ON product_specs(status);

-- 购物车表索引
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- 订单表索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_time ON orders(payment_time);
CREATE INDEX idx_orders_order_no ON orders(order_no);

-- 订单商品表索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 商品评价表索引
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_status ON product_reviews(status);
CREATE INDEX idx_product_reviews_created_at ON product_reviews(created_at);

-- 评价点赞表索引
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON review_likes(user_id);

-- 轮播图表索引
CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_sort ON banners(sort_order);
CREATE INDEX idx_banners_time ON banners(start_time, end_time);

-- 搜索记录表索引
CREATE INDEX idx_search_records_user_id ON search_records(user_id);
CREATE INDEX idx_search_records_keyword ON search_records(keyword);
CREATE INDEX idx_search_records_created_at ON search_records(created_at);

-- 热门搜索表索引
CREATE INDEX idx_hot_searches_status ON hot_searches(status);
CREATE INDEX idx_hot_searches_sort ON hot_searches(sort_order);
CREATE INDEX idx_hot_searches_count ON hot_searches(search_count);

-- 管理员表索引
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_status ON admins(status);

-- 操作日志表索引
CREATE INDEX idx_operation_logs_admin_id ON operation_logs(admin_id);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);

-- ================================
-- 8. 插入初始化数据
-- ================================

-- 插入系统配置数据
INSERT INTO system_configs (id, config_key, config_value, config_desc, config_type, is_public) VALUES
(1, 'site_name', '仿京东商城', '网站名称', 'string', 1),
(2, 'site_logo', '/images/logo.png', '网站Logo', 'string', 1),
(3, 'site_keywords', '电商,购物,商城,京东', '网站关键词', 'string', 1),
(4, 'site_description', '专业的电商购物平台', '网站描述', 'string', 1),
(5, 'default_shipping_fee', '10.00', '默认运费', 'number', 1),
(6, 'free_shipping_amount', '99.00', '免运费金额', 'number', 1),
(7, 'order_auto_cancel_time', '30', '订单自动取消时间(分钟)', 'number', 0),
(8, 'order_auto_confirm_time', '7', '订单自动确认收货时间(天)', 'number', 0);

-- 插入默认管理员账户 (密码: admin123)
INSERT INTO admins (id, username, password_hash, real_name, role, status) VALUES
(1, 'admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjPeOXANBjH/G5uyuFdJHyQoSdPKlO', '系统管理员', 'super', 1);

-- 插入商品分类数据
INSERT INTO categories (id, name, parent_id, level, sort_order, icon, status) VALUES
(1, '手机数码', 0, 1, 1, 'Smartphone', 1),
(2, '电脑办公', 0, 1, 2, 'Monitor', 1),
(3, '家用电器', 0, 1, 3, 'Tv', 1),
(4, '服饰内衣', 0, 1, 4, 'TShirt', 1),
(5, '运动户外', 0, 1, 5, 'Football', 1),
(6, '图书音像', 0, 1, 6, 'Reading', 1),
(7, '食品生鲜', 0, 1, 7, 'Apple', 1),
(8, '母婴用品', 0, 1, 8, 'Grape', 1),

-- 二级分类
(11, '手机通讯', 1, 2, 1, 'Smartphone', 1),
(12, '数码配件', 1, 2, 2, 'Headphones', 1),
(13, '智能设备', 1, 2, 3, 'Watch', 1),

(21, '电脑整机', 2, 2, 1, 'Monitor', 1),
(22, '电脑配件', 2, 2, 2, 'Cpu', 1),
(23, '办公设备', 2, 2, 3, 'Printer', 1),

(31, '大家电', 3, 2, 1, 'Tv', 1),
(32, '小家电', 3, 2, 2, 'Coffee', 1),
(33, '厨房电器', 3, 2, 3, 'Microwave', 1);

-- 插入品牌数据
INSERT INTO brands (id, name, description, status) VALUES
(1, '苹果', 'Apple Inc.', 1),
(2, '华为', 'HUAWEI', 1),
(3, '小米', 'Xiaomi', 1),
(4, '三星', 'Samsung', 1),
(5, '联想', 'Lenovo', 1),
(6, '戴尔', 'Dell', 1),
(7, '海尔', 'Haier', 1),
(8, '美的', 'Midea', 1),
(9, '格力', 'GREE', 1),
(10, '耐克', 'Nike', 1);

-- 插入热门搜索关键词
INSERT INTO hot_searches (id, keyword, search_count, sort_order, status) VALUES
(1, 'iPhone', 1000, 1, 1),
(2, '华为手机', 800, 2, 1),
(3, '小米电视', 600, 3, 1),
(4, '笔记本电脑', 500, 4, 1),
(5, '空调', 400, 5, 1),
(6, '冰箱', 300, 6, 1),
(7, '洗衣机', 250, 7, 1),
(8, '运动鞋', 200, 8, 1);

-- 插入轮播图数据
INSERT INTO banners (id, title, image, link_type, position, sort_order, status) VALUES
(1, '新品首发', '/images/banner1.jpg', 2, 'home', 1, 1),
(2, '限时特惠', '/images/banner2.jpg', 2, 'home', 2, 1),
(3, '品牌专场', '/images/banner3.jpg', 2, 'home', 3, 1),
(4, '数码专区', '/images/banner4.jpg', 2, 'home', 4, 1);

-- ================================
-- 9. 创建序列（用于主键自增）
-- ================================

-- 为所有表创建序列
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_user_addresses START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_user_favorites START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_categories START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_brands START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_products START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_product_images START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_product_specs START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_cart_items START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_orders START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_order_items START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_product_reviews START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_review_likes START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_banners START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_search_records START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_hot_searches START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_system_configs START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_admins START WITH 100 INCREMENT BY 1;
CREATE SEQUENCE seq_operation_logs START WITH 1 INCREMENT BY 1;

-- ================================
-- 数据库设计完成
-- ================================

-- 数据库设计说明：
-- 1. 采用达梦数据库语法，支持COMMENT注释
-- 2. 所有表都有主键和时间戳字段
-- 3. 合理设置外键约束，保证数据完整性
-- 4. 创建必要的索引，优化查询性能
-- 5. 插入基础配置和测试数据
-- 6. 支持完整的电商业务流程
-- 7. 预留扩展字段，便于后续功能扩展