import axios from 'axios';
import ProductCache from '../utils/productCache.js';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';
const PAGE_SIZE = 24;

const paginateData = (data, page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
};

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

    getProductsPaginated: async (page = 1) => {
        try {
            const allProducts = await ProductService.getAllProducts();
            return {
                data: paginateData(allProducts, page, PAGE_SIZE),
                totalCount: allProducts.length
            };
        } catch (error) {
            console.error('Error al obtener productos paginados:', error);
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