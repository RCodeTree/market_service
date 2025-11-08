const express = require('express');
const OrdersController = require('../controllers/orders.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// 订单创建与查询（需要登录）
router.post('/orders', authMiddleware, OrdersController.createOrder);
router.get('/orders', authMiddleware, OrdersController.getOrderList);
router.get('/orders/stats', authMiddleware, OrdersController.getOrderStats);
router.get('/orders/:id', authMiddleware, OrdersController.getOrderDetail);

// 用户订单（兼容前端 /user/orders 接口）
router.get('/user/orders', authMiddleware, OrdersController.getUserOrders);

// 订单操作
router.put('/orders/:id/cancel', authMiddleware, OrdersController.cancelOrder);
router.put('/orders/:id/confirm', authMiddleware, OrdersController.confirmReceive);
router.delete('/orders/:id', authMiddleware, OrdersController.deleteOrder);
router.post('/orders/:id/refund', authMiddleware, OrdersController.requestRefund);
router.post('/orders/:id/pay', authMiddleware, OrdersController.payOrder);
router.get('/orders/:id/payment-status', authMiddleware, OrdersController.getPaymentStatus);
router.post('/orders/:id/remind-shipping', authMiddleware, OrdersController.remindShipping);

// 404 交由应用级处理

module.exports = router;