const CartModel = require('../models/cart.model');

/**
 * 购物车业务逻辑服务
 */
class CartService {
  static async getCart(userId) {
    const list = await CartModel.listItems(userId);
    return list;
  }

  static async addToCart(userId, { productId, quantity = 1, skuId = null }) {
    if (!productId) {
      return { success: false, message: '缺少商品ID' };
    }
    if (quantity <= 0) {
      return { success: false, message: '数量必须大于0' };
    }
    const data = await CartModel.addItem(userId, productId, quantity, skuId);
    return { success: true, data };
  }

  static async updateQuantity(userId, itemId, quantity) {
    if (!itemId) {
      return { success: false, message: '缺少购物车项ID' };
    }
    const data = await CartModel.updateQuantity(userId, itemId, quantity);
    return { success: true, data };
  }

  static async removeItem(userId, itemId) {
    const data = await CartModel.removeItem(userId, itemId);
    return { success: true, data };
  }

  static async clearCart(userId) {
    const data = await CartModel.clearCart(userId);
    return { success: true, data };
  }

  static async batchRemove(userId, itemIds) {
    const data = await CartModel.batchRemove(userId, itemIds);
    return { success: true, data };
  }
}

module.exports = CartService;