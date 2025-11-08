const { GetDatabase } = require('../config/db');

/**
 * 订单数据模型
 * 负责订单相关的数据库操作
 */
class OrdersModel {
  static toNumber(v) {
    return typeof v === 'bigint' ? Number(v) : v;
  }

  static mapOrderRow(raw) {
    // 支持数组或对象两种返回格式
    if (Array.isArray(raw)) {
      const [
        id,
        order_no,
        user_id,
        order_type,
        status,
        total_amount,
        product_amount,
        shipping_amount,
        discount_amount,
        coupon_amount,
        points_amount,
        actual_amount,
        payment_method,
        payment_time,
        payment_no,
        shipping_time,
        delivery_time,
        receiver_name,
        receiver_phone,
        receiver_province,
        receiver_city,
        receiver_district,
        receiver_address,
        logistics_company,
        logistics_no,
        created_at
      ] = raw;
      return {
        id: this.toNumber(id),
        orderNumber: order_no,
        userId: this.toNumber(user_id),
        orderType: this.toNumber(order_type),
        status,
        totalAmount: this.toNumber(total_amount),
        productAmount: this.toNumber(product_amount),
        shippingFee: this.toNumber(shipping_amount),
        discountAmount: this.toNumber(discount_amount),
        couponAmount: this.toNumber(coupon_amount),
        pointsAmount: this.toNumber(points_amount),
        actualAmount: this.toNumber(actual_amount),
        paymentInfo: payment_method ? { method: payment_method, transactionId: payment_no || null } : null,
        paidAt: payment_time || null,
        shippedAt: shipping_time || null,
        deliveredAt: delivery_time || null,
        createdAt: created_at,
        shippingAddress: {
          recipientName: receiver_name,
          phone: receiver_phone,
          province: receiver_province,
          city: receiver_city,
          district: receiver_district,
          detailAddress: receiver_address
        },
        shippingCompany: logistics_company || null,
        trackingNumber: logistics_no || null
      };
    }
    return {
      id: this.toNumber(raw.ID),
      orderNumber: raw.ORDER_NO,
      userId: this.toNumber(raw.USER_ID),
      orderType: this.toNumber(raw.ORDER_TYPE),
      status: raw.STATUS,
      totalAmount: this.toNumber(raw.TOTAL_AMOUNT),
      productAmount: this.toNumber(raw.PRODUCT_AMOUNT),
      shippingFee: this.toNumber(raw.SHIPPING_AMOUNT),
      discountAmount: this.toNumber(raw.DISCOUNT_AMOUNT),
      couponAmount: this.toNumber(raw.COUPON_AMOUNT),
      pointsAmount: this.toNumber(raw.POINTS_AMOUNT),
      actualAmount: this.toNumber(raw.ACTUAL_AMOUNT),
      paymentInfo: raw.PAYMENT_METHOD ? { method: raw.PAYMENT_METHOD, transactionId: raw.PAYMENT_NO || null } : null,
      paidAt: raw.PAYMENT_TIME || null,
      shippedAt: raw.SHIPPING_TIME || null,
      deliveredAt: raw.DELIVERY_TIME || null,
      createdAt: raw.CREATED_AT,
      shippingAddress: {
        recipientName: raw.RECEIVER_NAME,
        phone: raw.RECEIVER_PHONE,
        province: raw.RECEIVER_PROVINCE,
        city: raw.RECEIVER_CITY,
        district: raw.RECEIVER_DISTRICT,
        detailAddress: raw.RECEIVER_ADDRESS
      },
      shippingCompany: raw.LOGISTICS_COMPANY || null,
      trackingNumber: raw.LOGISTICS_NO || null
    };
  }

  static mapItemRow(raw) {
    if (Array.isArray(raw)) {
      const [
        id,
        order_id,
        product_id,
        sku_id,
        product_name,
        product_image,
        spec_info,
        price,
        quantity
      ] = raw;
      return {
        id: this.toNumber(id),
        orderId: this.toNumber(order_id),
        productId: this.toNumber(product_id),
        skuId: sku_id ? this.toNumber(sku_id) : null,
        product: { name: product_name, image: product_image },
        specifications: spec_info ? this.safeParseSpec(spec_info) : {},
        price: this.toNumber(price),
        quantity: this.toNumber(quantity)
      };
    }
    return {
      id: this.toNumber(raw.ID),
      orderId: this.toNumber(raw.ORDER_ID),
      productId: this.toNumber(raw.PRODUCT_ID),
      skuId: raw.SKU_ID ? this.toNumber(raw.SKU_ID) : null,
      product: { name: raw.PRODUCT_NAME, image: raw.PRODUCT_IMAGE },
      specifications: raw.SPEC_INFO ? this.safeParseSpec(raw.SPEC_INFO) : {},
      price: this.toNumber(raw.PRICE),
      quantity: this.toNumber(raw.QUANTITY)
    };
  }

  static safeParseSpec(val) {
    try {
      // DM8 可能返回 VARCHAR 存储的 JSON 字符串
      if (typeof val === 'string') {
        const s = val.trim();
        if (s.startsWith('{') || s.startsWith('[')) return JSON.parse(s);
        // 如果是以 "规格:值,规格:值" 格式，做简单解析
        const obj = {};
        s.split(',').forEach(pair => {
          const [k, v] = pair.split(':');
          if (k && v) obj[k.trim()] = v.trim();
        });
        return obj;
      }
      return val;
    } catch (e) {
      return {};
    }
  }

  static async listOrders(userId, {
    page = 1,
    pageSize = 10,
    status = null,
    keyword = '',
    startDate = null,
    endDate = null,
    sortBy = 'created_desc'
  } = {}) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;

      const where = ['user_id = ?'];
      const params = [userId];
      if (status) {
        where.push('status = ?');
        params.push(status);
      }
      if (keyword && keyword.trim()) {
        where.push('(order_no LIKE ? OR receiver_name LIKE ?)');
        const kw = `%${keyword.trim()}%`;
        params.push(kw, kw);
      }
      if (startDate) {
        where.push('created_at >= ?');
        params.push(startDate);
      }
      if (endDate) {
        where.push('created_at <= ?');
        params.push(endDate);
      }

      let orderBy = 'created_at DESC';
      switch (sortBy) {
        case 'created_asc':
          orderBy = 'created_at ASC';
          break;
        case 'amount_desc':
          orderBy = 'total_amount DESC';
          break;
        case 'amount_asc':
          orderBy = 'total_amount ASC';
          break;
        default:
          orderBy = 'created_at DESC';
      }

      const offset = (page - 1) * pageSize;

      const countSql = `SELECT COUNT(*) AS total FROM MARKET.ORDERS WHERE ${where.join(' AND ')}`;
      const countResult = await conn.execute(countSql, params);
      const totalRaw = countResult.rows[0].TOTAL || countResult.rows[0][0];
      const total = this.toNumber(totalRaw);

      const listSql = `
        SELECT id, order_no, user_id, order_type, status,
               total_amount, product_amount, shipping_amount,
               discount_amount, coupon_amount, points_amount,
               actual_amount, payment_method, payment_time, payment_no,
               shipping_time, delivery_time,
               receiver_name, receiver_phone, receiver_province,
               receiver_city, receiver_district, receiver_address,
               logistics_company, logistics_no, created_at
        FROM MARKET.ORDERS
        WHERE ${where.join(' AND ')}
        ORDER BY ${orderBy} LIMIT ${pageSize}
        OFFSET ${offset}
      `;
      const listResult = await conn.execute(listSql, params);
      const orders = (listResult.rows || []).map(r => this.mapOrderRow(r));

      // 载入订单商品
      if (orders.length > 0) {
        const ids = orders.map(o => o.id);
        const placeholders = ids.map(() => '?').join(',');
        const itemsSql = `
          SELECT oi.id, oi.order_id, oi.product_id, oi.sku_id,
                 oi.product_name, oi.product_image,
                 CAST(oi.spec_info AS VARCHAR(500)) AS spec_info,
                 oi.price, oi.quantity
          FROM MARKET.ORDER_ITEMS oi
          WHERE oi.order_id IN (${placeholders})
          ORDER BY oi.id ASC
        `;
        const itemsResult = await conn.execute(itemsSql, ids);
        const items = (itemsResult.rows || []).map(r => this.mapItemRow(r));
        const grouping = {};
        for (const it of items) {
          if (!grouping[it.orderId]) grouping[it.orderId] = [];
          grouping[it.orderId].push(it);
        }
        orders.forEach(o => {
          o.items = grouping[o.id] || [];
          o.totalItems = o.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
        });
      }

      return { list: orders, total };
    } catch (error) {
      console.error('查询订单列表失败:', error);
      throw new Error('查询订单列表失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async getOrderById(userId, orderId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = `
        SELECT id, order_no, user_id, order_type, status,
               total_amount, product_amount, shipping_amount,
               discount_amount, coupon_amount, points_amount,
               actual_amount, payment_method, payment_time, payment_no,
               shipping_time, delivery_time,
               receiver_name, receiver_phone, receiver_province,
               receiver_city, receiver_district, receiver_address,
               logistics_company, logistics_no, created_at
        FROM MARKET.ORDERS
        WHERE id = ? AND user_id = ?
        FETCH FIRST 1 ROWS ONLY
      `;
      const result = await conn.execute(sql, [orderId, userId]);
      if (!result.rows || result.rows.length === 0) return null;
      const order = this.mapOrderRow(result.rows[0]);

      const itemsSql = `
        SELECT oi.id, oi.order_id, oi.product_id, oi.sku_id,
               oi.product_name, oi.product_image,
               CAST(oi.spec_info AS VARCHAR(500)) AS spec_info,
               oi.price, oi.quantity
        FROM MARKET.ORDER_ITEMS oi
        WHERE oi.order_id = ?
        ORDER BY oi.id ASC
      `;
      const itemsResult = await conn.execute(itemsSql, [orderId]);
      order.items = (itemsResult.rows || []).map(r => this.mapItemRow(r));
      order.totalItems = order.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
      return order;
    } catch (error) {
      console.error('查询订单详情失败:', error);
      throw new Error('查询订单详情失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async createOrder(userId, {
    items = [],
    receiver = {},
    buyerMessage = '',
    cartIds = [],
    shippingAmount: shippingAmountInput = 0,
    discountAmount: discountAmountInput = 0,
    couponAmount: couponAmountInput = 0,
    pointsAmount: pointsAmountInput = 0
  }) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('订单商品不能为空');
      }

      // 收货信息校验
      const requiredFields = ['recipientName', 'phone', 'province', 'city', 'district', 'detailAddress'];
      for (const f of requiredFields) {
        if (!receiver || !String(receiver[f] || '').trim()) {
          throw new Error('收货信息不完整，请填写完整的收货信息');
        }
      }
      const phoneStr = String(receiver.phone || '').trim();
      const phonePattern = /^1[3-9]\d{9}$/; // 简单中国大陆手机号校验
      if (!phonePattern.test(phoneStr)) {
        throw new Error('手机号格式不正确');
      }

      // 校验商品与计算金额
      let productAmount = 0;
      for (const it of items) {
        const qty = Number(it.quantity);
        const priceNum = Number(it.price);
        if (!it.productId || !qty || qty <= 0) {
          throw new Error('订单商品信息不合法');
        }
        // 验证商品状态与库存
        const pCheckRes = await conn.execute(
          'SELECT status, stock, name, main_image, price FROM MARKET.PRODUCTS WHERE id = ? FETCH FIRST 1 ROWS ONLY',
          [it.productId]
        );
        if (!pCheckRes.rows || pCheckRes.rows.length === 0) {
          throw new Error('商品不存在或已下架');
        }
        const pRow = pCheckRes.rows[0];
        const pStatus = Array.isArray(pRow) ? pRow[0] : pRow.STATUS;
        const pStock = Array.isArray(pRow) ? pRow[1] : pRow.STOCK;
        if (Number(pStatus) !== 1 || Number(pStock) < qty) {
          throw new Error('商品库存不足或已下架');
        }
        // 价格校验（允许传入价格，但需为有效数值）
        if (isNaN(priceNum) || priceNum < 0) {
          throw new Error('订单商品价格不合法');
        }
        productAmount += priceNum * qty;
      }
      // 费用项（来自前端，可选）
      let shippingAmount = Number(shippingAmountInput ?? 0);
      let discountAmount = Number(discountAmountInput ?? 0);
      let couponAmount = Number(couponAmountInput ?? 0);
      let pointsAmount = Number(pointsAmountInput ?? 0);
      shippingAmount = isNaN(shippingAmount) || shippingAmount < 0 ? 0 : shippingAmount;
      discountAmount = isNaN(discountAmount) || discountAmount < 0 ? 0 : discountAmount;
      couponAmount = isNaN(couponAmount) || couponAmount < 0 ? 0 : couponAmount;
      pointsAmount = isNaN(pointsAmount) || pointsAmount < 0 ? 0 : pointsAmount;
      const totalAmount = productAmount + shippingAmount - discountAmount - couponAmount - pointsAmount;
      const actualAmount = totalAmount;

      const id = Date.now() + Math.floor(Math.random() * 1000);
      const orderNo = `NB${id}`;

      const insertOrderSql = `
        INSERT INTO MARKET.ORDERS (
          id, order_no, user_id, order_type, status,
          total_amount, product_amount, shipping_amount,
          discount_amount, coupon_amount, points_amount,
          actual_amount,
          receiver_name, receiver_phone, receiver_province,
          receiver_city, receiver_district, receiver_address,
          buyer_message, created_at, updated_at
        ) VALUES (
          ?, ?, ?, 1, 'pending',
          ?, ?, ?,
          ?, ?, ?,
          ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;
      await conn.execute(insertOrderSql, [
        id, orderNo, userId,
        totalAmount, productAmount, shippingAmount,
        discountAmount, couponAmount, pointsAmount,
        actualAmount,
        receiver.recipientName || '',
        receiver.phone || '',
        receiver.province || '',
        receiver.city || '',
        receiver.district || '',
        receiver.detailAddress || '',
        buyerMessage || ''
      ]);

      for (const it of items) {
        const itemId = id + Math.floor(Math.random() * 1000);
        // 获取商品名称和图片
        const pRes = await conn.execute(
          'SELECT name, main_image FROM MARKET.PRODUCTS WHERE id = ? FETCH FIRST 1 ROWS ONLY',
          [it.productId]
        );
        const pRow = pRes.rows && pRes.rows[0];
        const pName = pRow ? (Array.isArray(pRow) ? pRow[0] : pRow.NAME) : '';
        const pImage = pRow ? (Array.isArray(pRow) ? pRow[1] : pRow.MAIN_IMAGE) : '';

        const insertItemSql = `
          INSERT INTO MARKET.ORDER_ITEMS (
            id, order_id, product_id, sku_id,
            product_name, product_image, spec_info,
            price, quantity, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const specInfoStr = typeof it.specifications === 'object' ? JSON.stringify(it.specifications) : (it.specifications || '');
        const total = Number(it.price) * Number(it.quantity);
        await conn.execute(insertItemSql, [
          itemId, id, it.productId, it.skuId || null,
          pName, pImage, specInfoStr,
          it.price, it.quantity, total
        ]);
      }

      // 初始状态日志
      const logId = id + Math.floor(Math.random() * 1000);
      await conn.execute(
        'INSERT INTO MARKET.ORDER_STATUS_LOGS (id, order_id, from_status, to_status, operator_type, operator_id, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [logId, id, null, 'pending', 1, userId, '订单创建']
      );

      // 清除购物车中已结算的商品
      if (Array.isArray(cartIds) && cartIds.length > 0) {
        const placeholders = cartIds.map(() => '?').join(',');
        await conn.execute(
          `DELETE FROM MARKET.CART_ITEMS WHERE user_id = ? AND id IN (${placeholders})`,
          [userId, ...cartIds]
        );
      }

      await conn.commit();
      return { id, orderNumber: orderNo };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('创建订单失败:', error);
      throw new Error(error.message || '创建订单失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async updateStatus(userId, orderId, toStatus, extra = {}) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      // 验证订单归属
      const check = await conn.execute('SELECT status FROM MARKET.ORDERS WHERE id = ? AND user_id = ?', [orderId, userId]);
      if (!check.rows || check.rows.length === 0) throw new Error('订单不存在');
      const currentStatus = Array.isArray(check.rows[0]) ? check.rows[0][0] : check.rows[0].STATUS;

      const fields = ['status = ?'];
      const params = [toStatus];

      if (toStatus === 'paid') {
        fields.push('payment_method = ?');
        fields.push('payment_time = CURRENT_TIMESTAMP');
        fields.push('payment_no = ?');
        params.push(extra.paymentMethod || 'alipay');
        params.push(extra.paymentNo || `PAY${Date.now()}`);
      } else if (toStatus === 'delivered') {
        fields.push('delivery_time = CURRENT_TIMESTAMP');
      } else if (toStatus === 'cancelled') {
        fields.push('cancel_reason = ?');
        params.push(extra.cancelReason || '');
      }

      const updateSql = `UPDATE MARKET.ORDERS SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
      params.push(orderId, userId);
      await conn.execute(updateSql, params);

      // 写入状态变更日志
      const logId = orderId + Math.floor(Math.random() * 1000);
      await conn.execute(
        'INSERT INTO MARKET.ORDER_STATUS_LOGS (id, order_id, from_status, to_status, operator_type, operator_id, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [logId, orderId, currentStatus, toStatus, 1, userId, extra.remark || '']
      );
      await conn.commit();
      return { from: currentStatus, to: toStatus };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('更新订单状态失败:', error);
      throw new Error('更新订单状态失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async deleteOrder(userId, orderId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const check = await conn.execute('SELECT status FROM MARKET.ORDERS WHERE id = ? AND user_id = ?', [orderId, userId]);
      if (!check.rows || check.rows.length === 0) throw new Error('订单不存在');
      const status = Array.isArray(check.rows[0]) ? check.rows[0][0] : check.rows[0].STATUS;
      if (!['completed', 'cancelled'].includes(status)) {
        throw new Error('仅已完成或已取消的订单可删除');
      }
      await conn.execute('DELETE FROM MARKET.ORDER_ITEMS WHERE order_id = ?', [orderId]);
      await conn.execute('DELETE FROM MARKET.ORDERS WHERE id = ? AND user_id = ?', [orderId, userId]);
      await conn.commit();
      return { deleted: true };
    } catch (error) {
      if (conn) await conn.rollback();
      console.error('删除订单失败:', error);
      throw new Error(error.message || '删除订单失败');
    } finally {
      if (conn) await conn.close();
    }
  }

  static async getStatusCounts(userId) {
    let conn = null;
    try {
      const { conn: connection } = await GetDatabase();
      conn = connection;
      const sql = `SELECT status, COUNT(*) AS cnt FROM MARKET.ORDERS WHERE user_id = ? GROUP BY status`;
      const result = await conn.execute(sql, [userId]);
      const counts = {};
      for (const r of result.rows || []) {
        const status = Array.isArray(r) ? r[0] : r.STATUS;
        const cntRaw = Array.isArray(r) ? r[1] : r.CNT;
        counts[status] = this.toNumber(cntRaw);
      }
      return counts;
    } catch (error) {
      console.error('统计订单状态失败:', error);
      throw new Error('统计订单状态失败');
    } finally {
      if (conn) await conn.close();
    }
  }
}

module.exports = OrdersModel;