const express = require('express');
const CartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 购物车需要登录
router.get('/cart', authMiddleware, CartController.getCart);
router.post('/cart', authMiddleware, CartController.addToCart);
router.put('/cart/:itemId', authMiddleware, CartController.updateQuantity);
router.delete('/cart/:itemId', authMiddleware, CartController.removeItem);
router.delete('/cart', authMiddleware, CartController.clearCart);
router.delete('/cart/batch', authMiddleware, CartController.batchRemove);

// 404 交由应用级处理

module.exports = router;