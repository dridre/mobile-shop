import axios from 'axios';
import ProductCache from '../utils/productCache.js';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

const ProductService = {
    init: async () => {
        await ProductCache.init();
    },

    getAllProducts: async () => {
        try {
            const cachedProducts = await ProductCache.getProductsList();

            if (cachedProducts) {
                return cachedProducts;
            }

            const response = await axios.get(`${API_BASE_URL}/product`);

            await ProductCache.saveProductsList(response.data);

            return response.data;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    getProductById: async (productId) => {
        try {
            const cachedProduct = await ProductCache.getProductDetails(productId);

            if (cachedProduct) {
                return cachedProduct;
            }

            const response = await axios.get(`${API_BASE_URL}/product/${productId}`);

            await ProductCache.saveProductDetails(productId, response.data);

            return response.data;
        } catch (error) {
            console.error(`Error al obtener producto ${productId}:`, error);
            throw error;
        }
    },

    clearProductsCache: async () => {
        return ProductCache.clearAllProductsCache();
    }
};

export default ProductService;