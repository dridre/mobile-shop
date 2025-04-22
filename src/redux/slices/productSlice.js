import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

const getProductsFromCache = () => {
    const cachedData = Cookies.get('productsData');
    const cachedTimestamp = Cookies.get('productsTimestamp');

    if (cachedData && cachedTimestamp) {

        const currentTime = new Date().getTime();
        const cachedTime = parseInt(cachedTimestamp);
        const ONE_HOUR = 60 * 60 * 1000;

        if (currentTime - cachedTime < ONE_HOUR) {
            return JSON.parse(cachedData);
        }
    }
    return null;
};

const getProductByIdFromCache = (id) => {
    const cachedData = Cookies.get(`product_${id}`);
    const cachedTimestamp = Cookies.get(`product_${id}_timestamp`);

    if (cachedData && cachedTimestamp) {
        const currentTime = new Date().getTime();
        const cachedTime = parseInt(cachedTimestamp);
        const ONE_HOUR = 60 * 60 * 1000;

        if (currentTime - cachedTime < ONE_HOUR) {
            return JSON.parse(cachedData);
        }
    }
    return null;
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const cachedProducts = getProductsFromCache();
            if (cachedProducts) {
                return cachedProducts;
            }

            const response = await axios.get(`${API_BASE_URL}/product`);

            const currentTime = new Date().getTime();
            Cookies.set('productsData', JSON.stringify(response.data), { expires: 1 / 24 });
            Cookies.set('productsTimestamp', currentTime.toString(), { expires: 1 / 24 });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const cachedProduct = getProductByIdFromCache(id);
            if (cachedProduct) {
                return cachedProduct;
            }

            const response = await axios.get(`${API_BASE_URL}/product/${id}`);

            const currentTime = new Date().getTime();
            Cookies.set(`product_${id}`, JSON.stringify(response.data), { expires: 1 / 24 });
            Cookies.set(`product_${id}_timestamp`, currentTime.toString(), { expires: 1 / 24 });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    items: [],
    selectedProduct: null,
    filteredItems: [],
    searchTerm: '',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            if (action.payload === '') {
                state.filteredItems = state.items;
            } else {
                const term = action.payload.toLowerCase();
                state.filteredItems = state.items.filter(
                    item =>
                        item.brand.toLowerCase().includes(term) ||
                        item.model.toLowerCase().includes(term)
                );
            }
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.filteredItems = action.payload;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchProductById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedProduct = action.payload;
                state.error = null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { setSearchTerm, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;