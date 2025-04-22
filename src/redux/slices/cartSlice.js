import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

const getInitialCart = () => {
    const savedCart = Cookies.get('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
};

const initialItems = getInitialCart();

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ product, colorCode, storageCode }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/cart`, {
                id: product.id,
                colorCode,
                storageCode
            });

            return {
                apiResponse: response.data,
                cartItem: {
                    id: product.id,
                    colorCode,
                    storageCode,
                }
            };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    items: initialItems,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        removeFromCart: (state, action) => {
            const index = action.payload;
            state.items.splice(index, 1);

            Cookies.set('cartItems', JSON.stringify(state.items), { expires: 1 / 24 });
        },
        clearCart: (state) => {
            state.items = [];

            Cookies.remove('cartItems');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCart.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.status = 'succeeded';

                state.items.push(action.payload.cartItem);

                Cookies.set('cartItems', JSON.stringify(state.items), { expires: 1 / 24 });

                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;