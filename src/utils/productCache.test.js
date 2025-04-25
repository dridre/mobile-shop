import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import ProductCache from './productCache.js';

global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;

if (typeof structuredClone === 'undefined') {
    global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

describe('ProductCache', () => {
    const mockProduct = {
        id: 1,
        brand: 'Apple',
        model: 'iPhone 12',
        price: 999,
        imgUrl: 'iphone12.jpg',
        cpu: 'A14 Bionic',
        ram: 4,
        os: 'iOS 14'
    };

    const mockProductsList = [
        mockProduct,
        {
            id: 2,
            brand: 'Samsung',
            model: 'Galaxy S21',
            price: 899,
            imgUrl: 'galaxys21.jpg',
            cpu: 'Exynos 2100',
            ram: 8,
            os: 'Android 11'
        }
    ];

    beforeAll(async () => {
        await ProductCache.init();
    });

    beforeEach(async () => {
        await ProductCache.clearAllProductsCache();
    });

    afterAll(async () => {
        if (ProductCache._db) {
            ProductCache._db.close();
            ProductCache._db = null;

            await new Promise((resolve, reject) => {
                const req = indexedDB.deleteDatabase('ProductCacheDB');
                req.onsuccess = resolve;
                req.onerror = reject;
            });
        }
    });

    describe('saveProductsList and getProductsList', () => {
        it('should save and retrieve products list', async () => {
            const saveResult = await ProductCache.saveProductsList(mockProductsList);
            expect(saveResult).toBe(true);

            const products = await ProductCache.getProductsList();
            expect(products).toHaveLength(2);
            expect(products).toEqual(expect.arrayContaining([
                expect.objectContaining(mockProduct),
                expect.objectContaining(mockProductsList[1])
            ]));
        });
        it('should return null when cache is expired', async () => {
            await ProductCache.saveProductDetails(mockProduct.id, mockProduct);

            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('ProductCacheDB', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            let transaction = db.transaction('products', 'readwrite');
            let store = transaction.objectStore('products');
            store.put({
                id: 'collection_meta',
                timestamp: Date.now(),
                count: 1
            });

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error);
            });

            const freshProduct = await ProductCache.getProductDetails(mockProduct.id);
            expect(freshProduct).toEqual(expect.objectContaining(mockProduct));

            transaction = db.transaction('products', 'readwrite');
            store = transaction.objectStore('products');
            store.put({
                id: 'collection_meta',
                timestamp: Date.now() - (2 * 60 * 60 * 1000),
                count: 1
            });

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = () => reject(transaction.error);
            });

            const expiredProduct = await ProductCache.getProductDetails(mockProduct.id);
            expect(expiredProduct).toBeNull();

            db.close();
        });


        it('should return false for invalid input', async () => {
            expect(await ProductCache.saveProductsList([])).toBe(false);
            expect(await ProductCache.saveProductsList(null)).toBe(false);
            expect(await ProductCache.saveProductsList(undefined)).toBe(false);
            expect(await ProductCache.saveProductsList({})).toBe(false);
        });
    });

    describe('saveProductDetails and getProductDetails', () => {
        it('should save and retrieve product details', async () => {
            const saveResult = await ProductCache.saveProductDetails(mockProduct.id, mockProduct);
            expect(saveResult).toBe(true);


            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open('ProductCacheDB', 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            const transaction = db.transaction('products', 'readwrite');
            const store = transaction.objectStore('products');
            const metaItem = {
                id: 'collection_meta',
                timestamp: Date.now(),
                count: 1
            };
            store.put(metaItem);

            await new Promise((resolve, reject) => {
                transaction.oncomplete = resolve;
                transaction.onerror = reject;
            });

            const product = await ProductCache.getProductDetails(mockProduct.id);
            expect(product).toEqual(expect.objectContaining(mockProduct));

            db.close();
        });


        it('should return null when cache is expired', async () => {

            await ProductCache.saveProductDetails(mockProduct.id, mockProduct);
            const product = await ProductCache.getProductDetails(mockProduct.id);

            expect(product).toBeNull();

            jest.restoreAllMocks();
        });

        it('should return null for invalid productId', async () => {
            expect(await ProductCache.getProductDetails(null)).toBeNull();
            expect(await ProductCache.getProductDetails(undefined)).toBeNull();
            expect(await ProductCache.getProductDetails('invalid')).toBeNull();
        });

        it('should return false for invalid save inputs', async () => {
            expect(await ProductCache.saveProductDetails(null, null)).toBe(false);
            expect(await ProductCache.saveProductDetails(1, null)).toBe(false);
            expect(await ProductCache.saveProductDetails(null, mockProduct)).toBe(false);
        });
    });

    describe('clearAllProductsCache', () => {
        it('should clear all cached products', async () => {
            await ProductCache.saveProductsList(mockProductsList);
            const clearResult = await ProductCache.clearAllProductsCache();
            expect(clearResult).toBe(true);

            const products = await ProductCache.getProductsList();
            expect(products).toBeNull();
        });
    });


});