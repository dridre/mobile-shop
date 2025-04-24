import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../services/productService';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            await ProductService.init();
            const products = await ProductService.getAllProducts();
            return products;
        } catch (error) {
            return rejectWithValue(error.message || 'Error al cargar productos');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            await ProductService.init();
            return await ProductService.getProductById(id);
        } catch (error) {
            return rejectWithValue(error.message || 'Error al cargar el producto');
        }
    }
);

const initialState = {
    items: [],
    selectedProduct: null,
    filteredItems: [],
    searchTerm: '',
    status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    cartCount: 0,
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
        },
        clearCache: () => {
            ProductService.clearProductsCache();
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

                // Asegurarnos de que el producto esté en la lista de productos
                if (state.items.length > 0 && !state.items.some(item => item.id === action.payload.id)) {
                    state.items = [...state.items, action.payload];
                    state.filteredItems = state.items;
                }
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
    },
});

export const {
    setSearchTerm,
    clearSelectedProduct,
    clearCache
} = productSlice.actions;

export default productSlice.reducer;