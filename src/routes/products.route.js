const express = require('express');
const ProductsController = require('../controllers/products.controller');
const {authMiddleware, optionalAuthMiddleware} = require('../middleware/auth.middleware');

const router = express.Router();

// 商品列表与搜索
router.get('/products', optionalAuthMiddleware, ProductsController.getProductList);
router.get('/products/search', optionalAuthMiddleware, ProductsController.searchProducts);
router.get('/products/hot', optionalAuthMiddleware, ProductsController.getHotProducts);
router.get('/products/recommended', optionalAuthMiddleware, ProductsController.getRecommendedProducts);
router.get('/products/new', optionalAuthMiddleware, ProductsController.getNewProducts);

// 商品详情
router.get('/products/:id', optionalAuthMiddleware, ProductsController.getProductDetail);

// 商品评价
router.get('/products/:id/reviews', optionalAuthMiddleware, ProductsController.getProductReviews);
router.post('/products/:id/reviews', authMiddleware, ProductsController.addProductReview);

// 分类相关
router.get('/categories', optionalAuthMiddleware, ProductsController.getCategories);
router.get('/categories/:categoryId/products', optionalAuthMiddleware, ProductsController.getProductsByCategory);

// 搜索建议
router.get('/products/search/suggestions', optionalAuthMiddleware, ProductsController.getSearchSuggestions);

// 保留 404 处理到应用级，避免影响其他模块路由

module.exports = router;