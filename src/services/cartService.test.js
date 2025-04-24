import axios from 'axios';
import CartCache from '../utils/cartCache.js';
import CartService from './cartService.js';

jest.mock('axios', () => ({
  post: jest.fn(),
}));

jest.mock('../utils/cartCache.js', () => ({
  init: jest.fn(),
  getCart: jest.fn(),
  addItemToCart: jest.fn(),
  isItemInCart: jest.fn(),
  removeItemFromCart: jest.fn(),
  clearCart: jest.fn(),
}));

const MOCK_API_RESPONSE = {
  count: 1,
  data: {
    id: 1,
    colorCode: 1,
    storageCode: 2,
    brand: 'Apple',
    model: 'iPhone 12',
    price: 999,
    imgUrl: 'image.jpg',
    createdAt: '2023-01-01T00:00:00.000Z'
  }
};

const MOCK_PRODUCT = {
  id: 1,
  brand: 'Apple',
  model: 'iPhone 12',
  imgUrl: 'image.jpg',
  price: 999
};

const MOCK_CART_ITEM = {
  id: 1,
  colorCode: 1,
  storageCode: 2,
  brand: 'Apple',
  model: 'iPhone 12',
  img: 'image.jpg'
};

describe('CartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize the CartCache', async () => {
      await CartService.init();
      expect(CartCache.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCartItems', () => {
    it('should return cart items from CartCache', async () => {
      CartCache.getCart.mockResolvedValue([MOCK_CART_ITEM]);

      const result = await CartService.getCartItems();
      expect(result).toEqual([MOCK_CART_ITEM]);
      expect(CartCache.getCart).toHaveBeenCalledTimes(1);
    });

    it('should return empty array on error', async () => {
      CartCache.getCart.mockRejectedValue(new Error('Cache error'));

      const result = await CartService.getCartItems();
      expect(result).toEqual([]);
      expect(CartCache.getCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      CartCache.isItemInCart.mockResolvedValue(false);
      axios.post.mockResolvedValue({ data: MOCK_API_RESPONSE });
      CartCache.addItemToCart.mockResolvedValue(true);

      const result = await CartService.addToCart(
        MOCK_PRODUCT,
        MOCK_CART_ITEM.colorCode,
        MOCK_CART_ITEM.storageCode
      );

      expect(CartCache.isItemInCart).toHaveBeenCalledWith(expect.objectContaining({
        id: MOCK_PRODUCT.id,
        colorCode: MOCK_CART_ITEM.colorCode,
        storageCode: MOCK_CART_ITEM.storageCode
      }));

      expect(axios.post).toHaveBeenCalledWith(
        'https://itx-frontend-test.onrender.com/api/cart',
        {
          id: MOCK_PRODUCT.id,
          colorCode: MOCK_CART_ITEM.colorCode,
          storageCode: MOCK_CART_ITEM.storageCode
        }
      );

      expect(CartCache.addItemToCart).toHaveBeenCalledWith(MOCK_CART_ITEM);

      expect(result).toEqual({
        apiResponse: MOCK_API_RESPONSE,
        cartItem: MOCK_CART_ITEM
      });
    });

    it('should throw error when item is already in cart', async () => {
      CartCache.isItemInCart.mockResolvedValue(true);

      await expect(
        CartService.addToCart(
          MOCK_PRODUCT,
          MOCK_CART_ITEM.colorCode,
          MOCK_CART_ITEM.storageCode
        )
      ).rejects.toThrow('Este producto con la misma configuración ya está en tu carrito');

      expect(axios.post).not.toHaveBeenCalled();
      expect(CartCache.addItemToCart).not.toHaveBeenCalled();
    });

    it('should throw error when API call fails', async () => {
      CartCache.isItemInCart.mockResolvedValue(false);
      const mockError = new Error('API error');
      axios.post.mockRejectedValue(mockError);

      await expect(
        CartService.addToCart(
          MOCK_PRODUCT,
          MOCK_CART_ITEM.colorCode,
          MOCK_CART_ITEM.storageCode
        )
      ).rejects.toThrow(mockError);

      expect(CartCache.addItemToCart).not.toHaveBeenCalled();
    });

    it('should throw error when cache update fails', async () => {
      CartCache.isItemInCart.mockResolvedValue(false);
      axios.post.mockResolvedValue({ data: MOCK_API_RESPONSE });
      CartCache.addItemToCart.mockResolvedValue(false);

      await expect(
        CartService.addToCart(
          MOCK_PRODUCT,
          MOCK_CART_ITEM.colorCode,
          MOCK_CART_ITEM.storageCode
        )
      ).rejects.toThrow('No se pudo añadir el producto al carrito');
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      CartCache.removeItemFromCart.mockResolvedValue(true);

      const result = await CartService.removeFromCart(0);
      expect(result).toBe(true);
      expect(CartCache.removeItemFromCart).toHaveBeenCalledWith(0);
    });

    it('should throw error when removal fails', async () => {
      const mockError = new Error('Removal error');
      CartCache.removeItemFromCart.mockRejectedValue(mockError);

      await expect(CartService.removeFromCart(0)).rejects.toThrow(mockError);
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      CartCache.clearCart.mockResolvedValue(true);

      const result = await CartService.clearCart();
      expect(result).toBe(true);
      expect(CartCache.clearCart).toHaveBeenCalledTimes(1);
    });

    it('should throw error when clearing fails', async () => {
      const mockError = new Error('Clear error');
      CartCache.clearCart.mockRejectedValue(mockError);

      await expect(CartService.clearCart()).rejects.toThrow(mockError);
    });
  });

  describe('getCartCount', () => {
    it('should return cart count', async () => {
      CartCache.getCart.mockResolvedValue([MOCK_CART_ITEM, { ...MOCK_CART_ITEM, id: 2 }]);

      const result = await CartService.getCartCount();
      expect(result).toBe(2);
      expect(CartCache.getCart).toHaveBeenCalledTimes(1);
    });

    it('should return 0 on error', async () => {
      CartCache.getCart.mockRejectedValue(new Error('Count error'));

      const result = await CartService.getCartCount();
      expect(result).toBe(0);
      expect(CartCache.getCart).toHaveBeenCalledTimes(1);
    });
  });
});