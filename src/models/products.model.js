const {GetDatabase} = require('../config/db');

/**
 * 商品数据模型
 * 负责商品相关的数据库操作
 */
class ProductsModel {
    static toNumber(v) {
        return typeof v === 'bigint' ? Number(v) : v;
    }

    static async listProducts({
                                  page = 1,
                                  pageSize = 24,
                                  keyword = '',
                                  category = null,
                                  priceRange = '',
                                  sortBy = 'default'
                              }) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const whereClauses = ['status = 1'];
            const params = [];

            if (keyword && keyword.trim()) {
                whereClauses.push('(name LIKE ? OR description LIKE ? OR keywords LIKE ? OR tags LIKE ?)');
                const kw = `%${keyword.trim()}%`;
                params.push(kw, kw, kw, kw);
            }

            if (category) {
                whereClauses.push('category_id = ?');
                params.push(category);
            }

            if (priceRange) {
                if (priceRange.includes('-')) {
                    const [minStr, maxStr] = priceRange.split('-');
                    const min = Number(minStr) || 0;
                    const max = Number(maxStr) || 0;
                    whereClauses.push('price BETWEEN ? AND ?');
                    params.push(min, max);
                } else if (priceRange.endsWith('+')) {
                    const min = Number(priceRange.replace('+', '')) || 0;
                    whereClauses.push('price >= ?');
                    params.push(min);
                }
            }

            // 排序
            let orderBy = 'created_at DESC';
            switch (sortBy) {
                case 'price_asc':
                    orderBy = 'price ASC';
                    break;
                case 'price_desc':
                    orderBy = 'price DESC';
                    break;
                case 'sales':
                    orderBy = 'sales_count DESC';
                    break;
                default:
                    orderBy = 'created_at DESC';
            }

            const offset = (page - 1) * pageSize;

            const countSql = `SELECT COUNT(*) AS total
                              FROM MARKET.PRODUCTS
                              WHERE ${whereClauses.join(' AND ')}`;
            const countResult = await conn.execute(countSql, params);
            const totalRaw = countResult.rows[0].TOTAL || countResult.rows[0].total || countResult.rows[0][0];
            const total = this.toNumber(totalRaw);

            const listSql = `
                SELECT id,
                       name,
                       subtitle,
                       price,
                       original_price,
                       CAST(description AS VARCHAR(500)) AS description,
                       main_image,
                       sales_count,
                       rating_avg,
                       review_count,
                       stock,
                       is_hot,
                       is_new,
                       is_recommend
                FROM MARKET.PRODUCTS
                WHERE ${whereClauses.join(' AND ')}
                ORDER BY ${orderBy} LIMIT ${pageSize}
                OFFSET ${offset}
            `;

            const listResult = await conn.execute(listSql, params);
            const list = (listResult.rows || []).map(row => this.formatProductListRow(row));

            return {list, total};
        } catch (error) {
            console.error('查询商品列表失败:', error);
            throw new Error('查询商品列表失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static formatProductListRow(raw) {
        // 数组格式
        if (Array.isArray(raw)) {
            const [id, name, subtitle, price, original_price, description, main_image, sales_count, rating_avg, review_count, stock, is_hot, is_new, is_recommend] = raw;
            return {
                id: this.toNumber(id),
                name,
                subtitle,
                price: this.toNumber(price),
                originalPrice: this.toNumber(original_price),
                description,
                image: main_image,
                sales: this.toNumber(sales_count),
                rating: this.toNumber(rating_avg),
                reviewCount: this.toNumber(review_count),
                stock: this.toNumber(stock),
                isHot: !!is_hot,
                isNew: !!is_new,
                isRecommend: !!is_recommend
            };
        }
        // 对象格式
        return {
            id: this.toNumber(raw.ID),
            name: raw.NAME,
            subtitle: raw.SUBTITLE,
            price: this.toNumber(raw.PRICE),
            originalPrice: this.toNumber(raw.ORIGINAL_PRICE),
            description: raw.DESCRIPTION,
            image: raw.MAIN_IMAGE,
            sales: this.toNumber(raw.SALES_COUNT),
            rating: this.toNumber(raw.RATING_AVG),
            reviewCount: this.toNumber(raw.REVIEW_COUNT),
            stock: this.toNumber(raw.STOCK),
            isHot: !!raw.IS_HOT,
            isNew: !!raw.IS_NEW,
            isRecommend: !!raw.IS_RECOMMEND
        };
    }

    static async getProductById(productId) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;

            const sql = `
                SELECT id,
                       name,
                       subtitle,
                       price,
                       original_price,
                       stock,
                       sales_count,
                       rating_avg,
                       review_count,
                       CAST(description AS VARCHAR(2000)) AS description,
                       CAST(detail_html AS VARCHAR(4000)) AS detail_html,
                       CAST(detail_mobile_html AS VARCHAR(4000)) AS detail_mobile_html,
                       main_image,
                       CAST(attributes AS VARCHAR(4000)) AS attributes,
                       CAST(service_guarantee AS VARCHAR(1000)) AS service_guarantee
                FROM MARKET.PRODUCTS
                WHERE id = ?
                  AND status = 1
            `;
            const result = await conn.execute(sql, [productId]);
            if (!result.rows || result.rows.length === 0) return null;

            const row = result.rows[0];
            const product = this.formatProductDetailRow(row);

            // 图片
            const imgSql = `SELECT image_url, is_main
                            FROM MARKET.PRODUCT_IMAGES
                            WHERE product_id = ?
                            ORDER BY sort_order ASC`;
            const imgResult = await conn.execute(imgSql, [productId]);
            const images = (imgResult.rows || []).map(r => Array.isArray(r) ? r[0] : r.IMAGE_URL);
            product.images = images.length > 0 ? images : (product.mainImage ? [product.mainImage] : []);

            // 规格
            const specNameSql = `SELECT id, spec_name
                                 FROM MARKET.PRODUCT_SPEC_NAMES
                                 WHERE product_id = ?
                                 ORDER BY sort_order ASC`;
            const specNameResult = await conn.execute(specNameSql, [productId]);
            const specNames = specNameResult.rows || [];
            const specifications = [];
            for (const sn of specNames) {
                const specNameId = Array.isArray(sn) ? sn[0] : sn.ID;
                const specName = Array.isArray(sn) ? sn[1] : sn.SPEC_NAME;
                const specValSql = `SELECT spec_value
                                    FROM MARKET.PRODUCT_SPEC_VALUES
                                    WHERE spec_name_id = ?
                                    ORDER BY sort_order ASC`;
                const specValResult = await conn.execute(specValSql, [specNameId]);
                const options = (specValResult.rows || []).map(v => ({value: Array.isArray(v) ? v[0] : v.SPEC_VALUE}));
                specifications.push({name: specName, options});
            }
            if (specifications.length > 0) {
                product.specifications = specifications;
            }

            // 参数（从 attributes JSON 派生为键值对列表）
            if (product.attributes) {
                try {
                    const attrs = typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes;
                    product.parameters = Object.keys(attrs).map(k => ({name: k, value: attrs[k]}));
                } catch (e) {
                    // 忽略解析错误
                }
            }

            return product;
        } catch (error) {
            console.error('查询商品详情失败:', error);
            throw new Error('查询商品详情失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static formatProductDetailRow(raw) {
        if (Array.isArray(raw)) {
            const [id, name, subtitle, price, original_price, stock, sales_count, rating_avg, review_count, description, detail_html, detail_mobile_html, main_image, attributes, service_guarantee] = raw;
            return {
                id: this.toNumber(id),
                name,
                subtitle,
                price: this.toNumber(price),
                originalPrice: this.toNumber(original_price),
                stock: this.toNumber(stock),
                sales: this.toNumber(sales_count),
                rating: this.toNumber(rating_avg),
                reviewCount: this.toNumber(review_count),
                description,
                details: detail_html,
                detailsMobile: detail_mobile_html,
                mainImage: main_image,
                attributes,
                serviceGuarantee: service_guarantee
            };
        }
        return {
            id: this.toNumber(raw.ID),
            name: raw.NAME,
            subtitle: raw.SUBTITLE,
            price: this.toNumber(raw.PRICE),
            originalPrice: this.toNumber(raw.ORIGINAL_PRICE),
            stock: this.toNumber(raw.STOCK),
            sales: this.toNumber(raw.SALES_COUNT),
            rating: this.toNumber(raw.RATING_AVG),
            reviewCount: this.toNumber(raw.REVIEW_COUNT),
            description: raw.DESCRIPTION,
            details: raw.DETAIL_HTML,
            detailsMobile: raw.DETAIL_MOBILE_HTML,
            mainImage: raw.MAIN_IMAGE,
            attributes: raw.ATTRIBUTES,
            serviceGuarantee: raw.SERVICE_GUARANTEE
        };
    }

    static async getHotProducts(limit = 10) {
        return await this.simpleList(`is_hot = 1`, 'sales_count DESC', limit);
    }

    static async getRecommendedProducts(limit = 10, excludeId = null) {
        const where = excludeId ? 'is_recommend = 1 AND id <> ?' : 'is_recommend = 1';
        const params = excludeId ? [excludeId] : [];
        return await this.simpleList(where, 'created_at DESC', limit, params);
    }

    static async getNewProducts(limit = 10) {
        return await this.simpleList('status = 1', 'created_at DESC', limit);
    }

    static async simpleList(where, orderBy, limit, params = []) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;
            const sql = `
                SELECT id,
                       name,
                       subtitle,
                       price,
                       original_price,
                       CAST(description AS VARCHAR(500)) AS description,
                       main_image,
                       sales_count,
                       rating_avg,
                       review_count,
                       stock
                FROM MARKET.PRODUCTS
                WHERE ${where}
                ORDER BY ${orderBy} LIMIT ${limit}
                OFFSET 0
            `;
            const result = await conn.execute(sql, params);
            return (result.rows || []).map(r => this.formatProductListRow(r));
        } catch (error) {
            console.error('查询商品简表失败:', error);
            throw new Error('查询商品失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async getCategories() {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;
            const sql = `SELECT id, name, parent_id, level
                         FROM MARKET.CATEGORIES
                         WHERE status = 1
                         ORDER BY sort_order ASC`;
            const result = await conn.execute(sql);
            const rows = result.rows || [];
            // 简单返回一级分类列表
            const categories = rows
                .filter(r => (Array.isArray(r) ? r[3] : r.LEVEL) === 1)
                .map(r => ({id: Array.isArray(r) ? r[0] : r.ID, name: Array.isArray(r) ? r[1] : r.NAME}));
            return categories;
        } catch (error) {
            console.error('查询分类失败:', error);
            throw new Error('查询分类失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async getProductReviews(productId, page = 1, pageSize = 10) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;
            const offset = (page - 1) * pageSize;
            const countSql = `SELECT COUNT(*) AS total
                              FROM MARKET.PRODUCT_REVIEWS
                              WHERE product_id = ?`;
            const countResult = await conn.execute(countSql, [productId]);
            const total = this.toNumber(countResult.rows[0].TOTAL || countResult.rows[0][0]);

            const sql = `
                SELECT id, user_id, rating, content, images, is_anonymous, created_at
                FROM MARKET.PRODUCT_REVIEWS
                WHERE product_id = ?
                ORDER BY created_at DESC
                    LIMIT ${pageSize}
                OFFSET ${offset}
            `;
            const result = await conn.execute(sql, [productId]);
            const list = (result.rows || []).map(r => {
                if (Array.isArray(r)) {
                    const [id, user_id, rating, content, images, is_anonymous, created_at] = r;
                    return {
                        id: this.toNumber(id),
                        userId: this.toNumber(user_id),
                        rating: this.toNumber(rating),
                        content,
                        images: images ? String(images).split(',').filter(Boolean) : [],
                        isAnonymous: !!is_anonymous,
                        createdAt: created_at
                    };
                }
                return {
                    id: this.toNumber(r.ID),
                    userId: this.toNumber(r.USER_ID),
                    rating: this.toNumber(r.RATING),
                    content: r.CONTENT,
                    images: r.IMAGES ? String(r.IMAGES).split(',').filter(Boolean) : [],
                    isAnonymous: !!r.IS_ANONYMOUS,
                    createdAt: r.CREATED_AT
                };
            });
            return {list, total, page, pageSize};
        } catch (error) {
            console.error('查询商品评价失败:', error);
            throw new Error('查询商品评价失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async addProductReview({productId, userId, rating, content, images}) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const imgStr = Array.isArray(images) ? images.join(',') : (images || null);
            const sql = `
                INSERT INTO MARKET.PRODUCT_REVIEWS (id, product_id, user_id, order_id, order_item_id, sku_id, rating,
                                                    content, images, is_anonymous, is_additional, created_at,
                                                    updated_at)
                VALUES (?, ?, ?, NULL, NULL, NULL, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            await conn.execute(sql, [id, productId, userId, rating, content || null, imgStr]);
            await conn.commit();
            return {id};
        } catch (error) {
            if (conn) await conn.rollback();
            console.error('新增商品评价失败:', error);
            throw new Error('新增商品评价失败');
        } finally {
            if (conn) await conn.close();
        }
    }

    static async getSearchSuggestions(keyword, limit = 10) {
        let conn = null;
        try {
            const {conn: connection} = await GetDatabase();
            conn = connection;
            const like = `%${keyword}%`;
            const sql = `
                SELECT name
                FROM MARKET.PRODUCTS
                WHERE status = 1
                  AND (name LIKE ? OR keywords LIKE ?)
                ORDER BY sales_count DESC
                    LIMIT ${limit}
                OFFSET 0
            `;
            const result = await conn.execute(sql, [like, like]);
            return (result.rows || []).map(r => Array.isArray(r) ? r[0] : r.NAME);
        } catch (error) {
            console.error('查询搜索建议失败:', error);
            throw new Error('查询搜索建议失败');
        } finally {
            if (conn) await conn.close();
        }
    }
}

module.exports = ProductsModel;