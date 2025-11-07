const ProductsModel = require('../models/products.model');

/**
 * 商品业务逻辑服务
 */
class ProductsService {
    static async getProductList(params) {
        const {page, pageSize, keyword, category, priceRange, sortBy} = params;
        const {list, total} = await ProductsModel.listProducts({page, pageSize, keyword, category, priceRange, sortBy});
        return {list, total, page, pageSize};
    }

    static async searchProducts(params) {
        // 直接复用列表逻辑
        return await this.getProductList(params);
    }

    static async getProductDetail(productId) {
        return await ProductsModel.getProductById(productId);
    }

    static async getHotProducts(limit) {
        return await ProductsModel.getHotProducts(limit);
    }

    static async getRecommendedProducts(limit, excludeId = null) {
        return await ProductsModel.getRecommendedProducts(limit, excludeId);
    }

    static async getNewProducts(limit) {
        return await ProductsModel.getNewProducts(limit);
    }

    static async getCategories() {
        return await ProductsModel.getCategories();
    }

    static async getProductsByCategory(categoryId, params) {
        const {page, pageSize, sortBy} = params;
        const {list, total} = await ProductsModel.listProducts({
            page,
            pageSize,
            keyword: '',
            category: categoryId,
            priceRange: '',
            sortBy
        });
        return {list, total, page, pageSize};
    }

    static async getProductReviews(productId, page, pageSize) {
        return await ProductsModel.getProductReviews(productId, page, pageSize);
    }

    static async addProductReview({productId, userId, rating, content, images}) {
        if (!rating || rating < 1 || rating > 5) {
            return {success: false, message: '评分必须在1-5之间'};
        }
        const data = await ProductsModel.addProductReview({productId, userId, rating, content, images});
        return {success: true, data};
    }

    static async getSearchSuggestions(keyword) {
        if (!keyword || keyword.trim().length < 2) {
            return [];
        }
        return await ProductsModel.getSearchSuggestions(keyword.trim(), 10);
    }
}

module.exports = ProductsService;