const { GetDatabase } = require('../config/db');

/**
 * 购物车数据模型
 */
class CartModel {
  static async listItems(userId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = `
        SELECT c.id,
               c.product_id,
               c.sku_id,
               c.quantity,
               c.price,
               c.selected,
               p.name AS product_name,
               p.main_image AS product_image
        FROM MARKET.CART_ITEMS c
        JOIN MARKET.PRODUCTS p ON p.id = c.product_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `;
      const result = await conn.execute(sql, [userId]);
      const rows = result.rows || [];
      return rows.map(r => {
        if (Array.isArray(r)) {
          const [id, product_id, sku_id, quantity, price, selected, product_name, product_image] = r;
          return {
            id,
            productId: product_id,
            skuId: sku_id,
            quantity,
            price,
            selected: !!selected,
            productName: product_name,
            productImage: product_image
          };
        }
        return {
          id: r.ID,
          productId: r.PRODUCT_ID,
          skuId: r.SKU_ID,
          quantity: r.QUANTITY,
          price: r.PRICE,
          selected: !!r.SELECTED,
          productName: r.PRODUCT_NAME,
          productImage: r.PRODUCT_IMAGE
        };
      });
    } catch (error) {
      console.error('查询购物车失败:', error);
      throw new Error('查询购物车失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async findItem(userId, productId, skuId = null) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = `
        SELECT id, quantity
        FROM MARKET.CART_ITEMS
        WHERE user_id = ? AND product_id = ? AND (sku_id = ? OR (? IS NULL AND sku_id IS NULL))
        FETCH FIRST 1 ROWS ONLY
      `;
      const result = await conn.execute(sql, [userId, productId, skuId, skuId]);
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        if (Array.isArray(row)) {
          return { id: row[0], quantity: row[1] };
        }
        return { id: row.ID, quantity: row.QUANTITY };
      }
      return null;
    } catch (error) {
      console.error('查询购物车项失败:', error);
      throw new Error('查询购物车项失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async addItem(userId, productId, quantity = 1, skuId = null) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;

      // 获取商品当前价格（使用 PRODUCTS.price）
      const priceSql = 'SELECT price, stock FROM MARKET.PRODUCTS WHERE id = ? AND status = 1';
      const priceResult = await conn.execute(priceSql, [productId]);
      if (!priceResult.rows || priceResult.rows.length === 0) {
        throw new Error('商品不存在或已下架');
      }
      const priceRow = priceResult.rows[0];
      const price = Array.isArray(priceRow) ? priceRow[0] : priceRow.PRICE;
      const stock = Array.isArray(priceRow) ? priceRow[1] : priceRow.STOCK;
      if (stock <= 0) {
        throw new Error('商品库存不足');
      }

      // 如果已存在则增加数量
      const existing = await this.findItem(userId, productId, skuId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        const updateSql = 'UPDATE MARKET.CART_ITEMS SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await conn.execute(updateSql, [newQty, existing.id]);
        await conn.commit();
        return { id: existing.id, quantity: newQty };
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      const insertSql = `
        INSERT INTO MARKET.CART_ITEMS (id, user_id, product_id, sku_id, quantity, price, selected, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      await conn.execute(insertSql, [id, userId, productId, skuId, quantity, price]);
      await conn.commit();
      return { id };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('添加购物车失败:', error);
      throw new Error(error.message || '添加购物车失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async updateQuantity(userId, itemId, quantity) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      if (quantity <= 0) {
        const delSql = 'DELETE FROM MARKET.CART_ITEMS WHERE id = ? AND user_id = ?';
        await conn.execute(delSql, [itemId, userId]);
        await conn.commit();
        return { deleted: true };
      }
      const sql = 'UPDATE MARKET.CART_ITEMS SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
      const result = await conn.execute(sql, [quantity, itemId, userId]);
      await conn.commit();
      return { updated: true };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('更新购物车数量失败:', error);
      throw new Error('更新购物车数量失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async removeItem(userId, itemId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = 'DELETE FROM MARKET.CART_ITEMS WHERE id = ? AND user_id = ?';
      await conn.execute(sql, [itemId, userId]);
      await conn.commit();
      return { deleted: true };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('移除购物车失败:', error);
      throw new Error('移除购物车失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async clearCart(userId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = 'DELETE FROM MARKET.CART_ITEMS WHERE user_id = ?';
      await conn.execute(sql, [userId]);
      await conn.commit();
      return { cleared: true };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('清空购物车失败:', error);
      throw new Error('清空购物车失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async batchRemove(userId, itemIds = []) {
    if (!Array.isArray(itemIds) || itemIds.length === 0) return { deleted: 0 };
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      // 构建占位符
      const placeholders = itemIds.map(() => '?').join(',');
      const sql = `DELETE FROM MARKET.CART_ITEMS WHERE user_id = ? AND id IN (${placeholders})`;
      await conn.execute(sql, [userId, ...itemIds]);
      await conn.commit();
      return { deleted: itemIds.length };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('批量删除购物车失败:', error);
      throw new Error('批量删除购物车失败');
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = CartModel;