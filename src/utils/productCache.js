const CACHE_EXPIRY = 60 * 60 * 1000;
const DB_NAME = 'ProductCacheDB';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const CACHE_META_KEY = 'collection_meta';

const transactionComplete = (transaction) => {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

const IndexedDBCache = {
    _db: null,

    async init() {
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                resolve(this._db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
                    const store = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    async setItem(item) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
                const store = transaction.objectStore(PRODUCTS_STORE);

                const cacheItem = {
                    ...item,
                    timestamp: new Date().getTime()
                };

                const request = store.put(cacheItem);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error(`Error guardando item en caché:`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en setItem:', error);
            return false;
        }
    },

    async getItem(id) {
        try {
            const isExpired = await this.isCollectionExpired();
            if (isExpired) {
                return null;
            }

            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
                const store = transaction.objectStore(PRODUCTS_STORE);
                const request = store.get(id);

                request.onsuccess = (event) => {
                    const item = event.target.result;
                    if (!item) {
                        resolve(null);
                        return;
                    }
                    resolve(item);
                };

                request.onerror = (event) => {
                    console.error(`Error obteniendo item: ${id}`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en getItem:', error);
            return null;
        }
    },

    async setItems(items) {
        try {
            const db = await this.init();
            const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
            const store = transaction.objectStore(PRODUCTS_STORE);
            const timestamp = new Date().getTime();

            const promises = items.map(item => {
                return new Promise((resolve, reject) => {
                    const cacheItem = {
                        ...item,
                        timestamp
                    };

                    const request = store.put(cacheItem);
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject(event.target.error);
                });
            });

            const metaItem = {
                id: CACHE_META_KEY,
                timestamp,
                count: items.length
            };
            store.put(metaItem);

            await Promise.all([
                Promise.all(promises),
                transactionComplete(transaction)
            ]);

            return true;
        } catch (error) {
            console.error('Error en setItems:', error);
            return false;
        }
    },

    async isCollectionExpired() {
        try {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
                const store = transaction.objectStore(PRODUCTS_STORE);
                const request = store.get(CACHE_META_KEY);

                request.onsuccess = (event) => {
                    const meta = event.target.result;
                    if (!meta) {
                        resolve(true);
                        return;
                    }

                    const currentTime = new Date().getTime();
                    const isExpired = currentTime - meta.timestamp > CACHE_EXPIRY;
                    resolve(isExpired);
                };

                request.onerror = () => {
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error verificando expiración de colección:', error);
            return true;
        }
    },

    async getAllItems() {
        try {
            const isExpired = await this.isCollectionExpired();
            if (isExpired) {
                return null;
            }

            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
                const store = transaction.objectStore(PRODUCTS_STORE);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const items = event.target.result.filter(item => item.id !== CACHE_META_KEY);
                    resolve(items);
                };

                request.onerror = (event) => {
                    console.error('Error obteniendo todos los items', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en getAllItems:', error);
            return null;
        }
    },

    async clearCache() {
        try {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
                const store = transaction.objectStore(PRODUCTS_STORE);

                store.clear();

                transaction.oncomplete = () => {
                    resolve(true);
                };

                transaction.onerror = (event) => {
                    console.error('Error limpiando caché', event.target.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error en clearCache:', error);
            return false;
        }
    }
};

const ProductCache = {
    _db: null,

    init: async () => {
        ProductCache._db = await IndexedDBCache.init();
        return true;
    },

    saveProductsList: async (products) => {
        if (!products || !Array.isArray(products) || products.length === 0) {
            console.error('Lista de productos inválida');
            return false;
        }

        return IndexedDBCache.setItems(products);
    },

    getProductsList: async () => {
        return IndexedDBCache.getAllItems();
    },

    saveProductDetails: async (productId, productData) => {
        if (!productId || !productData) {
            console.error('Datos de producto inválidos');
            return false;
        }

        const product = {
            ...productData,
            id: productId
        };

        return IndexedDBCache.setItem(product);
    },

    getProductDetails: async (productId) => {
        if (!productId) {
            console.error('ID de producto inválido');
            return null;
        }

        try {
            const product = await IndexedDBCache.getItem(productId);
            return product || null;
        } catch (error) {
            console.error(`Error al obtener detalles del producto ${productId}:`, error);
            return null;
        }
    },

    clearAllProductsCache: async () => {
        return IndexedDBCache.clearCache();
    }
};

export default ProductCache;