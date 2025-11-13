const ProductsService = require('../services/products.service');
const { ok, error, jsonResponse } = require('../utils/response');

/**
 * 商品控制器
 * 处理商品相关的HTTP请求
 */
class ProductsController {
  static async getProductList(req, res) {
    try {
      const params = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 24,
        keyword: req.query.keyword || '',
        category: req.query.category ? Number(req.query.category) : null,
        priceRange: req.query.priceRange || '',
        sortBy: req.query.sortBy || 'default',
        userId: req.user?.userId || null
      };

      const result = await ProductsService.getProductList(params);
      // 调试输出，定位循环结构或 BigInt 来源
      try {
        console.log('DEBUG:getProductList result meta', {
          isArray: Array.isArray(result.list),
          length: result.list?.length,
          sample: result.list?.[0],
          total: result.total
        });
        if (result.list && result.list[0]) {
          console.log('DEBUG:sample keys', Object.keys(result.list[0]));
        }
      } catch (e) {
        console.log('DEBUG:getProductList log error', e?.message);
      }
      return ok(res, '获取商品列表成功', { list: result.list, total: result.total, page: result.page, pageSize: result.pageSize });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: error.message || '服务器内部错误',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getProductDetail(req, res) {
    try {
      const productId = Number(req.params.id);
      const result = await ProductsService.getProductDetail(productId);
      if (!result) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: '商品不存在或已下架',
          timestamp: new Date().toISOString()
        });
      }
      return ok(res, '获取商品详情成功', result);
    } catch (error) {
      console.error('获取商品详情失败:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: error.message || '服务器内部错误',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async searchProducts(req, res) {
    try {
      const params = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 24,
        keyword: req.query.keyword || '',
        category: req.query.category ? Number(req.query.category) : null,
        priceRange: req.query.priceRange || '',
        sortBy: req.query.sortBy || 'default'
      };
      const result = await ProductsService.searchProducts(params);
      return ok(res, '搜索商品成功', result);
    } catch (error) {
      console.error('搜索商品失败:', error);
      return res.status(500).json({
        success: false,
        code: 500,
        message: error.message || '服务器内部错误',
        timestamp: new Date().toISOString()
      });
    }
  }

  static async getHotProducts(req, res) {
    try {
      const limit = Number(req.query.limit) || 10;
      const result = await ProductsService.getHotProducts(limit);
      return ok(res, '获取热门商品成功', result);
    } catch (error) {
      console.error('获取热门商品失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getRecommendedProducts(req, res) {
    try {
      const limit = Number(req.query.limit) || 10;
      const excludeId = req.query.excludeId ? Number(req.query.excludeId) : null;
      const result = await ProductsService.getRecommendedProducts(limit, excludeId);
      return ok(res, '获取推荐商品成功', result);
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getNewProducts(req, res) {
    try {
      const limit = Number(req.query.limit) || 10;
      const result = await ProductsService.getNewProducts(limit);
      return ok(res, '获取新品成功', result);
    } catch (error) {
      console.error('获取新品失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getCategories(req, res) {
    try {
      const result = await ProductsService.getCategories();
      return ok(res, '获取分类成功', result);
    } catch (error) {
      console.error('获取分类失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getProductsByCategory(req, res) {
    try {
      const categoryId = Number(req.params.categoryId);
      const params = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 24,
        sortBy: req.query.sortBy || 'default'
      };
      const result = await ProductsService.getProductsByCategory(categoryId, params);
      return ok(res, '获取分类下商品成功', result);
    } catch (error) {
      console.error('获取分类下商品失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getProductReviews(req, res) {
    try {
      const productId = Number(req.params.id);
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const result = await ProductsService.getProductReviews(productId, page, pageSize);
      return ok(res, '获取商品评价成功', result);
    } catch (error) {
      console.error('获取商品评价失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async addProductReview(req, res) {
    try {
      const productId = Number(req.params.id);
      const userId = req.user.userId;
      const { rating, content, images } = req.body;
      const result = await ProductsService.addProductReview({ productId, userId, rating, content, images });
      if (result.success) {
        return jsonResponse(res, 201, { success: true, code: 201, message: '评价提交成功', data: result.data, timestamp: new Date().toISOString() });
      }
      return res.status(400).json({ success: false, code: 400, message: result.message || '评价提交失败', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('提交商品评价失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }

  static async getSearchSuggestions(req, res) {
    try {
      const keyword = req.query.keyword || '';
      const result = await ProductsService.getSearchSuggestions(keyword);
      return ok(res, '获取搜索建议成功', result);
    } catch (error) {
      console.error('获取搜索建议失败:', error);
      return res.status(500).json({ success: false, code: 500, message: error.message || '服务器内部错误', timestamp: new Date().toISOString() });
    }
  }
}

module.exports = ProductsController;
