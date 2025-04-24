import axios from 'axios';
import CartCache from '../utils/cartCache.js';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

const CartService = {
    init: async () => {
        await CartCache.init();
    },

    getCartItems: async () => {
        try {
            return await CartCache.getCart();
        } catch (error) {
            console.error('Error al obtener items del carrito:', error);
            return [];
        }
    },

    addToCart: async (product, colorCode, storageCode) => {
        try {
            const cartItem = {
                id: product.id,
                colorCode,
                storageCode,
                brand: product.brand,
                model: product.model,
                img: product.imgUrl
            };

            const isDuplicate = await CartCache.isItemInCart(cartItem);
            if (isDuplicate) {
                throw new Error('Este producto con la misma configuración ya está en tu carrito');
            }

            const response = await axios.post(`${API_BASE_URL}/cart`, {
                id: product.id,
                colorCode,
                storageCode
            });

            const success = await CartCache.addItemToCart(cartItem);

            if (!success) {
                throw new Error('No se pudo añadir el producto al carrito');
            }

            return {
                apiResponse: response.data,
                cartItem
            };
        } catch (error) {
            console.error('Error al añadir producto al carrito:', error);
            throw error;
        }
    },

    removeFromCart: async (index) => {
        try {
            const success = await CartCache.removeItemFromCart(index);
            return success;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            const success = await CartCache.clearCart();
            return success;
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            throw error;
        }
    },

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