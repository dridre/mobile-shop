import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import CartCache from './cartCache.js';

global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;

describe('CartCache', () => {
  const mockItem = {
    id: 1,
    colorCode: 1,
    storageCode: 2,
    brand: 'Apple',
    model: 'iPhone 12',
    img: 'image.jpg'
  };

  beforeEach(async () => {
    if (CartCache._db) {
      CartCache._db.close();
    }

    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase('CartCacheDB');
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error deleting DB');
      req.onblocked = () => reject('Delete blocked');
    });

    CartCache._db = null;
  });

  afterEach(() => {
    if (CartCache._db) {
      CartCache._db.close();
      CartCache._db = null;
    }
  });

  if (typeof global.structuredClone !== 'function') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
  }

  describe('init', () => {
    it('should initialize the database', async () => {
      const db = await CartCache.init();
      expect(db).toBeDefined();
      expect(db.version).toBe(2);
      expect(db.objectStoreNames.contains('cart')).toBe(true);
    });

    it('should return existing db instance on subsequent calls', async () => {
      const db1 = await CartCache.init();
      const db2 = await CartCache.init();
      expect(db1).toBe(db2);
    });
  });

  describe('isCartExpired', () => {
    it('should return true when no meta exists', async () => {
      const isExpired = await CartCache.isCartExpired();
      expect(isExpired).toBe(true);
    });

    it('should return false when cart is not expired', async () => {
      await CartCache.saveCart([mockItem]);
      const isExpired = await CartCache.isCartExpired();
      expect(isExpired).toBe(false);
    });

    it('should return true when cart is expired', async () => {
      const db = await CartCache.init();
      const transaction = db.transaction('cart', 'readwrite');
      const store = transaction.objectStore('cart');

      store.put({
        uniqueKey: 'cart_meta',
        timestamp: Date.now() - (2 * 60 * 60 * 1000)
      });

      await new Promise(resolve => transaction.oncomplete = resolve);

      const isExpired = await CartCache.isCartExpired();
      expect(isExpired).toBe(true);
    });
  });

  describe('saveCart and getCart', () => {
    it('should save and retrieve cart items', async () => {
      await CartCache.saveCart([mockItem]);
      const cartItems = await CartCache.getCart();

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].id).toEqual(mockItem.id);
      expect(cartItems[0].colorCode).toEqual(mockItem.colorCode);
      expect(cartItems[0].storageCode).toEqual(mockItem.storageCode);
      expect(cartItems[0].brand).toEqual(mockItem.brand);
      expect(cartItems[0].model).toEqual(mockItem.model);
      expect(cartItems[0].img).toEqual(mockItem.img);
    });

    it('should return empty array when cart is expired', async () => {
      await CartCache.saveCart([mockItem]);

      const db = await CartCache.init();
      const transaction = db.transaction('cart', 'readwrite');
      const store = transaction.objectStore('cart');
      store.put({
        uniqueKey: 'cart_meta',
        timestamp: Date.now() - (2 * 60 * 60 * 1000)
      });
      await new Promise(resolve => transaction.oncomplete = resolve);

      const cartItems = await CartCache.getCart();
      expect(cartItems).toEqual([]);
    });

    it('should handle empty cart', async () => {
      await CartCache.saveCart([]);
      const cartItems = await CartCache.getCart();
      expect(cartItems).toEqual([]);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      await CartCache.saveCart([mockItem]);
      await CartCache.clearCart();
      const cartItems = await CartCache.getCart();
      expect(cartItems).toEqual([]);
    });
  });

  describe('addItemToCart', () => {
    it('should add item to cart', async () => {
      await CartCache.addItemToCart(mockItem);
      const cartItems = await CartCache.getCart();

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].id).toEqual(mockItem.id);
      expect(cartItems[0].colorCode).toEqual(mockItem.colorCode);
      expect(cartItems[0].storageCode).toEqual(mockItem.storageCode);
    });

    it('should not add duplicate items', async () => {
      await CartCache.addItemToCart(mockItem);
      await CartCache.addItemToCart(mockItem);

      const cartItems = await CartCache.getCart();
      expect(cartItems).toHaveLength(1);
    });

    it('should handle multiple items with different properties', async () => {
      const mockItem2 = { ...mockItem, id: 2 };
      await CartCache.addItemToCart(mockItem);
      await CartCache.addItemToCart(mockItem2);

      const cartItems = await CartCache.getCart();
      expect(cartItems).toHaveLength(2);
      expect(cartItems.map(item => item.id)).toContain(1);
      expect(cartItems.map(item => item.id)).toContain(2);
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart by index', async () => {
      await CartCache.addItemToCart(mockItem);
      await CartCache.addItemToCart({ ...mockItem, id: 2 });

      await CartCache.removeItemFromCart(0);
      const cartItems = await CartCache.getCart();

      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].id).toBe(2);
    });

    it('should return false for invalid index', async () => {
      await CartCache.addItemToCart(mockItem);
      const result = await CartCache.removeItemFromCart(5)
      expect(result).toBe(false);
    });
  });

  describe('isItemInCart', () => {
    it('should return true when item is in cart', async () => {
      await CartCache.addItemToCart(mockItem);
      const isInCart = await CartCache.isItemInCart(mockItem);
      expect(isInCart).toBe(true);
    });

    it('should return false when item is not in cart', async () => {
      const differentItem = { ...mockItem, id: 999 };
      await CartCache.addItemToCart(mockItem);
      const isInCart = await CartCache.isItemInCart(differentItem);
      expect(isInCart).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle errors in getCart', async () => {
      await CartCache.saveCart([mockItem]);

      CartCache._db.close();

      const result = await CartCache.getCart();
      expect(result).toEqual([]);
    });
  });
});