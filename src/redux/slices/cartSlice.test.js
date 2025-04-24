import { addToCart, removeCartItem, clearCartItems, initializeCart } from './cartSlice';
import CartService from '../../services/cartService';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

jest.mock('../../services/cartService', () => ({
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  init: jest.fn(),
  getCartItems: jest.fn(),
}));

jest.mock('axios', () => ({
  post: jest.fn(),
}));

const MOCK_CART_ITEMS = [
  {
    id: 1,
    colorCode: 1,
    storageCode: 2,
    brand: 'Apple',
    model: 'iPhone 12',
    price: 999,
    imgUrl: 'image.jpg',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
];

const MOCK_PRODUCT = {
  id: 1,
  brand: 'Apple',
  model: 'iPhone 12',
  imgUrl: 'image.jpg',
  price: 999,
};

const MOCK_CART_ITEM = {
  id: 1,
  colorCode: 1,
  storageCode: 2,
  brand: 'Apple',
  model: 'iPhone 12',
  img: 'image.jpg',
};

describe('Cart Slice Async Actions', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: { cart: cartReducer },
    });
  });

  test('initializeCart action - success', async () => {
    CartService.getCartItems.mockResolvedValue(MOCK_CART_ITEMS);

    await store.dispatch(initializeCart());


    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual(MOCK_CART_ITEMS);
    expect(state.error).toBeNull();
  });

  test('addToCart action - success', async () => {
    const mockResponse = {
      cartItem: MOCK_CART_ITEM,
    };

    CartService.addToCart.mockResolvedValue(mockResponse);

    await store.dispatch(addToCart({ product: MOCK_PRODUCT, colorCode: 1, storageCode: 2 }));

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.items).toContainEqual(MOCK_CART_ITEM);
    expect(state.error).toBeNull();
  });



  test('removeCartItem action - success', async () => {
    CartService.removeFromCart.mockResolvedValue(true);

    await store.dispatch(removeCartItem(1));

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.items.length).toBe(0);
    expect(state.error).toBeNull();
  });

  test('clearCartItems action - success', async () => {
    CartService.clearCart.mockResolvedValue(true);

    await store.dispatch(clearCartItems());

    const state = store.getState().cart;
    expect(state.status).toBe('succeeded');
    expect(state.items).toEqual([]);
    expect(state.error).toBeNull();
  });


});
