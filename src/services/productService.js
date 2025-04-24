import axios from 'axios';
import ProductCache from '../utils/productCache.js';

// URL base de la API
const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

// Servicio para gestionar los productos
const ProductService = {
    // Inicializa el servicio de productos
    init: async () => {
        await ProductCache.init();
    },

    // Obtiene todos los productos
    getAllProducts: async () => {
        try {
            // Intenta obtener productos desde la caché
            const cachedProducts = await ProductCache.getProductsList();

            // Si hay productos en caché y no están expirados, los devuelve
            if (cachedProducts) {
                return cachedProducts;
            }

            // Si no hay caché o expiró, obtiene productos de la API
            const response = await axios.get(`${API_BASE_URL}/product`);

            // Guarda productos en caché para futuros accesos
            await ProductCache.saveProductsList(response.data);

            return response.data;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    // Obtiene un producto específico por su ID
    getProductById: async (productId) => {
        try {
            // Intenta obtener el producto desde la caché
            const cachedProduct = await ProductCache.getProductDetails(productId);

            // Si está en caché y tiene datos completos, lo devuelve
            if (cachedProduct && cachedProduct.cpu) {
                return cachedProduct;
            }

            // Si no tiene el producto en caché, carga la lista completa
            if (!cachedProduct) {
                const response = await axios.get(`${API_BASE_URL}/product`);
                await ProductCache.saveProductsList(response.data);
            }

            // Obtiene los detalles específicos del producto desde la API
            const response = await axios.get(`${API_BASE_URL}/product/${productId}`);

            // Guarda los detalles en caché
            await ProductCache.saveProductDetails(productId, response.data);

            return response.data;
        } catch (error) {
            console.error(`Error al obtener producto ${productId}:`, error);
            throw error;
        }
    },

    // Limpia toda la caché de productos
    clearProductsCache: async () => {
        return ProductCache.clearAllProductsCache();
    }
};

export default ProductService;