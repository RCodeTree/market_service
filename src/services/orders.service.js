const OrdersModel = require('../models/orders.model');

/**
 * 订单业务逻辑服务
 */
class OrdersService {
  static async listOrders(userId, params) {
    const { page = 1, pageSize = 10, status, keyword, startDate, endDate, sortBy } = params || {};
    const { list, total } = await OrdersModel.listOrders(userId, { page, pageSize, status, keyword, startDate, endDate, sortBy });
    return { list, total, page, pageSize };
  }

  static async getOrderDetail(userId, orderId) {
    return await OrdersModel.getOrderById(userId, orderId);
  }

  static async createOrder(userId, orderData) {
    const data = await OrdersModel.createOrder(userId, orderData);
    return { success: true, data };
  }

  static async cancelOrder(userId, orderId, reason) {
    // 验证当前状态，避免非 pending 取消
    const detail = await OrdersModel.getOrderById(userId, orderId);
    if (!detail) return { success: false, message: '订单不存在' };
    if (detail.status !== 'pending') return { success: false, message: '仅待付款订单可取消' };
    const result = await OrdersModel.updateStatus(userId, orderId, 'cancelled', { cancelReason: reason, remark: '用户取消订单' });
    return { success: true, data: result };
  }

  static async confirmReceive(userId, orderId) {
    const detail = await OrdersModel.getOrderById(userId, orderId);
    if (!detail) return { success: false, message: '订单不存在' };
    if (detail.status !== 'shipped') return { success: false, message: '当前订单状态不可确认收货' };
    const result = await OrdersModel.updateStatus(userId, orderId, 'delivered', { remark: '用户确认收货' });
    return { success: true, data: result };
  }

  static async deleteOrder(userId, orderId) {
    const result = await OrdersModel.deleteOrder(userId, orderId);
    return { success: true, data: result };
  }

  static async requestRefund(userId, orderId, refundReason) {
    // 简化处理：设置为退款中
    const result = await OrdersModel.updateStatus(userId, orderId, 'refunding', { refundReason });
    return { success: true, data: result };
  }

  static async payOrder(userId, orderId, paymentData = {}) {
    const detail = await OrdersModel.getOrderById(userId, orderId);
    if (!detail) return { success: false, message: '订单不存在' };
    if (detail.status !== 'pending') return { success: false, message: '当前订单状态不可支付' };
    const result = await OrdersModel.updateStatus(userId, orderId, 'paid', {
      paymentMethod: paymentData.method || 'alipay',
      paymentNo: paymentData.transactionId || undefined,
      remark: '用户支付订单'
    });
    return { success: true, data: result };
  }

  static async getPaymentStatus(userId, orderId) {
    const order = await OrdersModel.getOrderById(userId, orderId);
    if (!order) return { success: false, message: '订单不存在' };
    const paid = order.status === 'paid' || !!order.paidAt;
    return { success: true, data: { paid, status: order.status } };
  }

  static async getOrderStats(userId) {
    const counts = await OrdersModel.getStatusCounts(userId);
    return counts;
  }

  static async remindShipping(userId, orderId) {
    // 记录日志或触发通知，简化为直接成功
    return { success: true };
  }
}

module.exports = OrdersService;