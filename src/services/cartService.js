import axios from 'axios';
import CartCache from '../utils/cartCache.js';

// URL base de la API
const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

// Servicio para gestionar el carrito de compras
const CartService = {
    // Inicializa el servicio del carrito
    init: async () => {
        await CartCache.init();
    },

    // Obtiene los elementos del carrito desde la caché
    getCartItems: async () => {
        try {
            return await CartCache.getCart();
        } catch (error) {
            console.error('Error al obtener items del carrito:', error);
            return [];
        }
    },

    // Añade un producto al carrito
    addToCart: async (product, colorCode, storageCode) => {
        try {
            // Crea objeto del item para el carrito
            const cartItem = {
                id: product.id,
                colorCode,
                storageCode,
                brand: product.brand,
                model: product.model,
                img: product.imgUrl
            };

            // Verifica si ya existe para evitar duplicados
            const isDuplicate = await CartCache.isItemInCart(cartItem);
            if (isDuplicate) {
                throw new Error('Este producto con la misma configuración ya está en tu carrito');
            }

            // Realiza la petición a la API
            const response = await axios.post(`${API_BASE_URL}/cart`, {
                id: product.id,
                colorCode,
                storageCode
            });

            // Guarda en la caché local
            const success = await CartCache.addItemToCart(cartItem);

            if (!success) {
                throw new Error('No se pudo añadir el producto al carrito');
            }

            // Devuelve tanto la respuesta de la API como el item añadido
            return {
                apiResponse: response.data,
                cartItem
            };
        } catch (error) {
            console.error('Error al añadir producto al carrito:', error);
            throw error;
        }
    },

    // Elimina un producto del carrito por su índice
    removeFromCart: async (index) => {
        try {
            const success = await CartCache.removeItemFromCart(index);
            return success;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            throw error;
        }
    },

    // Vacía completamente el carrito
    clearCart: async () => {
        try {
            const success = await CartCache.clearCart();
            return success;
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    },

    // Obtiene el número de productos en el carrito
    getCartCount: async () => {
        try {
            const items = await CartCache.getCart();
            return items.length;
        } catch (error) {
            console.error('Error al obtener la cantidad de productos en el carrito:', error);
            return 0;
        }
    }
};

export default CartService;