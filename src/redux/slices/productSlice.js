import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ProductService from '../../services/productService';

// Thunk para obtener todos los productos
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

// Thunk para obtener un producto específico por su ID
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

// Estado inicial de los productos
const initialState = {
    items: [],                // Lista completa de productos
    selectedProduct: null,    // Producto seleccionado para ver detalles
    filteredItems: [],        // Productos filtrados por búsqueda
    searchTerm: '',           // Término de búsqueda actual
    status: 'idle',           // Estado: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,              // Mensaje de error si existe
    cartCount: 0,             // Contador de productos en el carrito
};

// Slice para gestionar el estado de los productos
const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {

        // Actualiza el término de búsqueda y filtra los productos
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            if (action.payload === '') {

                // Si no hay búsqueda, muestra todos los productos
                state.filteredItems = state.items;
            } else {

                // Filtra por marca o modelo
                const term = action.payload.toLowerCase();
                state.filteredItems = state.items.filter(
                    item =>
                        item.brand.toLowerCase().includes(term) ||
                        item.model.toLowerCase().includes(term)
                );
            }
        },

        // Limpia el producto seleccionado
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },

        // Limpia la caché de productos
        clearCache: () => {
            ProductService.clearProductsCache();
        }
    },
    extraReducers: (builder) => {
        builder
            // Casos para cargar todos los productos
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

            // Casos para cargar un producto por ID
            .addCase(fetchProductById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedProduct = action.payload;
                state.error = null;

                // Si el producto no existe en items, lo añade
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

// Exporta las acciones síncronas
export const {
    setSearchTerm,
    clearSelectedProduct,
    clearCache
} = productSlice.actions;

export default productSlice.reducer;