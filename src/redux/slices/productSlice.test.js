import { fetchProducts, fetchProductById, setSearchTerm, clearSelectedProduct, clearCache } from './productSlice';
import ProductService from '../../services/productService';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';

jest.mock('../../services/productService', () => ({
  init: jest.fn(),
  getAllProducts: jest.fn(),
  getProductById: jest.fn(),
  clearProductsCache: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

const MOCK_PRODUCTS = [
  {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 12',
    price: 999,
    imgUrl: 'image.jpg',
  },
  {
    id: 2,
    brand: 'Samsung',
    model: 'Galaxy S21',
    price: 799,
    imgUrl: 'image2.jpg',
  },
];

const MOCK_PRODUCT = {
  id: 1,
  brand: 'Apple',
  model: 'iPhone 12',
  price: 999,
  imgUrl: 'image.jpg',
};

describe('Product Slice Async Actions', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: { products: productReducer },
    });
  });

  test('fetchProducts action - success', async () => {
    ProductService.getAllProducts.mockResolvedValue(MOCK_PRODUCTS);

    await store.dispatch(fetchProducts());

    const state = store.getState().products;
    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual(MOCK_PRODUCTS);
    expect(state.filteredItems).toEqual(MOCK_PRODUCTS);
    expect(state.error).toBeNull();
  });



  test('fetchProductById action - success', async () => {
    await store.dispatch({
      type: 'products/fetchProducts/fulfilled',
      payload: MOCK_PRODUCTS,
    });

    ProductService.getProductById.mockResolvedValue(MOCK_PRODUCT);

    await store.dispatch(fetchProductById(1));

    const state = store.getState().products;

    expect(state.selectedProduct).toEqual(MOCK_PRODUCT);

    expect(state.searchTerm).toBe('');

    expect(state.filteredItems).toEqual(MOCK_PRODUCTS);

    expect(state.error).toBeNull();
  });




  test('setSearchTerm action', () => {
    store.dispatch({
      type: 'products/fetchProducts/fulfilled',
      payload: MOCK_PRODUCTS,
    });

    store.dispatch(setSearchTerm('iphone'));

    const state = store.getState().products;

    expect(state.searchTerm).toBe('iphone');

    expect(state.filteredItems.length).toBe(1);

    expect(state.filteredItems[0].model).toBe('iPhone 12');
  });

  test('clearSelectedProduct action', () => {
    store.dispatch(fetchProductById(1));

    store.dispatch(clearSelectedProduct());

    const state = store.getState().products;
    expect(state.selectedProduct).toBeNull();
  });

  test('clearCache action', () => {
    store.dispatch(clearCache());

    expect(ProductService.clearProductsCache).toHaveBeenCalled();
  });
});
