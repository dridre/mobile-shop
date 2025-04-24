// Tiempo de expiración de la caché: 1 hora en milisegundos
const CACHE_EXPIRY = 60 * 60 * 1000;

// Configuración de la base de datos IndexedDB
const DB_NAME = 'ProductCacheDB';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const CACHE_META_KEY = 'collection_meta';

// Función para crear promesa que se resuelve cuando la transacción se completa
const transactionComplete = (transaction) => {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
    });
};

// Implementación genérica de caché con IndexedDB
const IndexedDBCache = {
    _db: null,

    // Inicializa la conexión a IndexedDB
    async init() {
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            // Maneja error al abrir la base de datos
            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB:', event.target.error);
                reject(event.target.error);
            };

            // Se ejecuta cuando la conexión es exitosa
            request.onsuccess = (event) => {
                this._db = event.target.result;
                resolve(this._db);
            };

            // Se ejecuta cuando hay que actualizar la estructura de la BD
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crea el almacén si no existe
                if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
                    const store = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    },

    // Guarda un elemento individual en la caché
    async setItem(item) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
                const store = transaction.objectStore(PRODUCTS_STORE);

                // Añade timestamp al elemento
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

    // Obtiene un elemento por su ID
    async getItem(id) {
        try {
            // Verifica si la colección expiró
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

    // Guarda una colección de elementos
    async setItems(items) {
        try {
            const db = await this.init();
            const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
            const store = transaction.objectStore(PRODUCTS_STORE);
            const timestamp = new Date().getTime();

            // Crea promesas para guardar cada elemento
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

            // Guarda metadatos con timestamp para expiración
            const metaItem = {
                id: CACHE_META_KEY,
                timestamp,
                count: items.length
            };
            store.put(metaItem);

            // Espera a que todas las operaciones terminen
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

    // Verifica si la colección ha expirado
    async isCollectionExpired() {
        try {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
                const store = transaction.objectStore(PRODUCTS_STORE);
                const request = store.get(CACHE_META_KEY);

                request.onsuccess = (event) => {
                    const meta = event.target.result;
                    // Si no hay metadatos, se considera expirado
                    if (!meta) {
                        resolve(true);
                        return;
                    }

                    // Compara el timestamp con el tiempo actual
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

    // Obtiene todos los elementos de la colección
    async getAllItems() {
        try {
            // Verifica si la colección expiró
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
                    // Filtra los metadatos para devolver solo productos
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

    // Limpia toda la caché
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

// API específica para la caché de productos
const ProductCache = {
    _db: null,

    // Inicializa la conexión a la caché
    init: async () => {
        ProductCache._db = await IndexedDBCache.init();
        return true;
    },

    // Guarda lista de productos
    saveProductsList: async (products) => {
        if (!products || !Array.isArray(products) || products.length === 0) {
            console.error('Lista de productos inválida');
            return false;
        }

        return IndexedDBCache.setItems(products);
    },

    // Obtiene todos los productos
    getProductsList: async () => {
        return IndexedDBCache.getAllItems();
    },

    // Guarda detalles de un producto específico
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

    // Obtiene detalles de un producto específico
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

    // Limpia toda la caché de productos
    clearAllProductsCache: async () => {
        return IndexedDBCache.clearCache();
    }
};

export default ProductCache;