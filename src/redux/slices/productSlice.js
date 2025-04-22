import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'https://itx-frontend-test.onrender.com/api';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/product`);
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
            const response = await axios.get(`${API_BASE_URL}/product/${id}`);
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