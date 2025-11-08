const OrdersService = require('../services/orders.service');
const { ok, error, jsonResponse } = require('../utils/response');

/**
 * 订单控制器
 */
class OrdersController {
  static async createOrder(req, res) {
    try {
      const userId = req.user.userId;
      const orderData = req.body || {};
      const result = await OrdersService.createOrder(userId, orderData);
      return jsonResponse(res, 201, {
        success: true,
        code: 201,
        message: '订单创建成功',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error('创建订单失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async getOrderList(req, res) {
    try {
      const userId = req.user.userId;
      const params = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status || null,
        keyword: req.query.keyword || '',
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        sortBy: req.query.sortBy || 'created_desc'
      };
      const result = await OrdersService.listOrders(userId, params);
      return ok(res, '获取订单列表成功', result);
    } catch (e) {
      console.error('获取订单列表失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async getUserOrders(req, res) {
    try {
      const userId = req.user.userId;
      const params = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        status: req.query.status || null
      };
      const { list, total } = await OrdersService.listOrders(userId, params);
      const statusCounts = await OrdersService.getOrderStats(userId);
      return ok(res, '获取用户订单成功', { orders: list, total, statusCounts });
    } catch (e) {
      console.error('获取用户订单失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async getOrderDetail(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const order = await OrdersService.getOrderDetail(userId, orderId);
      if (!order) return error(res, 404, '订单不存在或无权限', 404);
      return ok(res, '获取订单详情成功', order);
    } catch (e) {
      console.error('获取订单详情失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async cancelOrder(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const reason = req.body?.reason || '';
      const result = await OrdersService.cancelOrder(userId, orderId, reason);
      return ok(res, '订单已取消', result.data);
    } catch (e) {
      console.error('取消订单失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async confirmReceive(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const result = await OrdersService.confirmReceive(userId, orderId);
      return ok(res, '确认收货成功', result.data);
    } catch (e) {
      console.error('确认收货失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async deleteOrder(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const result = await OrdersService.deleteOrder(userId, orderId);
      return ok(res, '订单已删除', result.data);
    } catch (e) {
      console.error('删除订单失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async requestRefund(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const refundReason = req.body?.reason || '';
      const result = await OrdersService.requestRefund(userId, orderId, refundReason);
      return ok(res, '申请退款成功', result.data);
    } catch (e) {
      console.error('申请退款失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async payOrder(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const paymentData = req.body || {};
      const result = await OrdersService.payOrder(userId, orderId, paymentData);
      return ok(res, '支付成功', result.data);
    } catch (e) {
      console.error('支付订单失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async getPaymentStatus(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      const result = await OrdersService.getPaymentStatus(userId, orderId);
      if (!result.success) return error(res, 404, result.message || '订单不存在');
      return ok(res, '获取支付状态成功', result.data);
    } catch (e) {
      console.error('获取支付状态失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async getOrderStats(req, res) {
    try {
      const userId = req.user.userId;
      const counts = await OrdersService.getOrderStats(userId);
      return ok(res, '获取订单状态统计成功', counts);
    } catch (e) {
      console.error('获取订单状态统计失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }

  static async remindShipping(req, res) {
    try {
      const userId = req.user.userId;
      const orderId = Number(req.params.id);
      await OrdersService.remindShipping(userId, orderId);
      return ok(res, '提醒发货成功', { orderId });
    } catch (e) {
      console.error('提醒发货失败:', e);
      return error(res, 500, e.message || '服务器内部错误');
    }
  }
}

module.exports = OrdersController;