import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CartService from '../../services/cartService';

// Función para cargar los items iniciales del carrito
const loadInitialItems = async () => {
    await CartService.init();
    return CartService.getCartItems();
};

// Thunk para añadir un producto al carrito
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product, colorCode, storageCode }, { rejectWithValue }) => {
        try {
            return await CartService.addToCart(product, colorCode, storageCode);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al añadir al carrito');
        }
    }
);

// Thunk para eliminar un producto del carrito por su índice
export const removeCartItem = createAsyncThunk(
    'cart/removeItem',
    async (index, { rejectWithValue }) => {
        try {
            const success = await CartService.removeFromCart(index);
            if (success) {
                return index;
            }
            return rejectWithValue('Error al eliminar del carrito');
        } catch (error) {
            return rejectWithValue(error.message || 'Error al eliminar del carrito');
        }
    }
);

// Thunk para vaciar completamente el carrito
export const clearCartItems = createAsyncThunk(
    'cart/clearItems',
    async (_, { rejectWithValue }) => {
        try {
            const success = await CartService.clearCart();
            if (success) {
                return true;
            }
            return rejectWithValue('Error al limpiar el carrito');
        } catch (error) {
            return rejectWithValue(error.message || 'Error al limpiar el carrito');
        }
    }
);

// Thunk para inicializar el carrito desde localStorage o la API
export const initializeCart = createAsyncThunk(
    'cart/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const items = await loadInitialItems();
            return items;
        } catch (error) {
            return rejectWithValue(error.message || 'Error al inicializar el carrito');
        }
    }
);

// Estado inicial del carrito
const initialState = {
    items: [],                // Productos en el carrito
    status: 'idle',           // Estado: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,              // Mensaje de error si existe
};

// Slice para gestionar el estado del carrito
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Casos para inicializar el carrito
            .addCase(initializeCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(initializeCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(initializeCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Casos para añadir al carrito
            .addCase(addToCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload.cartItem);
                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Casos para eliminar del carrito
            .addCase(removeCartItem.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.splice(action.payload, 1);
                state.error = null;
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Casos para vaciar el carrito
            .addCase(clearCartItems.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(clearCartItems.fulfilled, (state) => {
                state.status = 'succeeded';
                state.items = [];
                state.error = null;
            })
            .addCase(clearCartItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default cartSlice.reducer;