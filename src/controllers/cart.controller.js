const CartService = require('../services/cart.service');

/**
 * 购物车控制器
 */
class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.user.userId;
      const list = await CartService.getCart(userId);
      return res.status(200).json({
        success: true,
        code: 200,
        message: '获取购物车成功',
        data: list,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('获取购物车失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async addToCart(req, res) {
    try {
      const userId = req.user.userId;
      const { productId, quantity, skuId } = req.body;
      const result = await CartService.addToCart(userId, { productId, quantity, skuId });
      if (result.success) {
        return res.status(201).json({ success: true, code: 201, message: '已添加到购物车', data: result.data, timestamp: new Date().toISOString() });
      }
      return res.status(400).json({ success: false, code: 400, message: result.message || '添加失败', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('添加到购物车失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async updateQuantity(req, res) {
    try {
      const userId = req.user.userId;
      const itemId = Number(req.params.itemId);
      const { quantity } = req.body;
      const result = await CartService.updateQuantity(userId, itemId, Number(quantity));
      if (result.success) {
        return res.status(200).json({ success: true, code: 200, message: '更新成功', data: result.data, timestamp: new Date().toISOString() });
      }
      return res.status(400).json({ success: false, code: 400, message: result.message || '更新失败', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async removeItem(req, res) {
    try {
      const userId = req.user.userId;
      const itemId = Number(req.params.itemId);
      const result = await CartService.removeItem(userId, itemId);
      return res.status(200).json({ success: true, code: 200, message: '已移除', data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('移除购物车失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async clearCart(req, res) {
    try {
      const userId = req.user.userId;
      const result = await CartService.clearCart(userId);
      return res.status(200).json({ success: true, code: 200, message: '购物车已清空', data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('清空购物车失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async batchRemove(req, res) {
    try {
      const userId = req.user.userId;
      const { itemIds = [] } = req.body || {};
      const result = await CartService.batchRemove(userId, itemIds);
      return res.status(200).json({ success: true, code: 200, message: '批量移除成功', data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('批量删除购物车失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }
}

module.exports = CartController;