import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../services/productService';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const result = await ProductService.getProductsPaginated(1);
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al cargar productos');
        }
    }
);

export const fetchMoreProducts = createAsyncThunk(
    'products/fetchMoreProducts',
    async (page, { rejectWithValue }) => {
        try {
            const result = await ProductService.getProductsPaginated(page);
            return {
                ...result,
                page
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al cargar más productos');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            return await ProductService.getProductById(id);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al cargar el producto');
        }
    }
);

export const addProductToCart = createAsyncThunk(
    'products/addProductToCart',
    async ({ productId, colorCode, storageCode }, { rejectWithValue }) => {
        try {
            return await ProductService.addToCart(productId, colorCode, storageCode);
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error al añadir el producto al carrito');
        }
    }
);

const initialState = {
    items: [],
    allProductsCount: 0,
    selectedProduct: null,
    filteredItems: [],
    searchTerm: '',
    status: 'idle',          // 'idle' | 'loading' | 'loading-more' | 'succeeded' | 'failed'
    currentPage: 1,
    hasMore: true,
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
        resetPagination: (state) => {
            state.currentPage = 1;
            state.hasMore = true;
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
                state.items = action.payload.data;
                state.filteredItems = action.payload.data;
                state.allProductsCount = action.payload.totalCount;
                state.currentPage = 1;
                state.hasMore = state.items.length < action.payload.totalCount;
                state.error = null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchMoreProducts.pending, (state) => {
                state.status = 'loading-more';
            })
            .addCase(fetchMoreProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';

                if (action.payload.page === 1) {
                    state.items = action.payload.data;
                } else {
                    const existingIds = new Set(state.items.map(p => p.id));
                    const uniqueNewProducts = action.payload.data.filter(p => !existingIds.has(p.id));
                    state.items = [...state.items, ...uniqueNewProducts];
                }

                state.currentPage = action.payload.page;

                if (state.searchTerm) {
                    const term = state.searchTerm.toLowerCase();
                    state.filteredItems = state.items.filter(
                        item =>
                            item.brand.toLowerCase().includes(term) ||
                            item.model.toLowerCase().includes(term)
                    );
                } else {
                    state.filteredItems = state.items;
                }

                state.hasMore = state.items.length < action.payload.totalCount;
                state.error = null;
            })
            .addCase(fetchMoreProducts.rejected, (state, action) => {
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
            })

            .addCase(addProductToCart.pending, (state) => {

            })
            .addCase(addProductToCart.fulfilled, (state, action) => {
                state.cartCount = action.payload.count;
            })
            .addCase(addProductToCart.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    setSearchTerm,
    clearSelectedProduct,
    resetPagination,
    clearCache
} = productSlice.actions;

export default productSlice.reducer;
