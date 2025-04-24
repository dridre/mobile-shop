const CACHE_EXPIRY = 60 * 60 * 1000;
const DB_NAME = 'CartCacheDB';
const DB_VERSION = 2;
const CART_STORE = 'cart';
const CART_META_KEY = 'cart_meta';

const CartCache = {
    _db: null,

    async init() {
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB para el carrito:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this._db = event.target.result;
                resolve(this._db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (db.objectStoreNames.contains(CART_STORE)) {
                    db.deleteObjectStore(CART_STORE);
                }

                const store = db.createObjectStore(CART_STORE, {
                    keyPath: 'uniqueKey',
                    autoIncrement: false
                });

                store.createIndex('productId', 'productId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            };
        });
    },

    async isCartExpired() {
        try {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(CART_STORE, 'readonly');
                const store = transaction.objectStore(CART_STORE);
                const request = store.get(CART_META_KEY);

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
            console.error('Error verificando expiración del carrito:', error);
            return true;
        }
    },

    async saveCart(cartItems) {
        try {
            const db = await this.init();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readwrite');
                const store = transaction.objectStore(CART_STORE);
                const timestamp = new Date().getTime();

                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    let itemsProcessed = 0;

                    store.put({
                        uniqueKey: CART_META_KEY,
                        timestamp: timestamp
                    });

                    if (cartItems.length === 0) {
                        resolve(true);
                        return;
                    }

                    cartItems.forEach((item) => {
                        const uniqueKey = `${item.id}-${item.colorCode}-${item.storageCode}`;

                        const request = store.add({
                            ...item,
                            uniqueKey: uniqueKey,
                            productId: item.id,
                            timestamp: timestamp
                        });

                        request.onsuccess = () => {
                            itemsProcessed++;
                            if (itemsProcessed === cartItems.length) {
                                resolve(true);
                            }
                        };

                        request.onerror = (event) => {
                            console.error('Error guardando item del carrito:', event.target.error);
                            reject(event.target.error);
                        };
                    });
                };

                clearRequest.onerror = (event) => {
                    console.error('Error limpiando carrito:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en saveCart:', error);
            return false;
        }
    },

    async getCart() {
        try {
            const isExpired = await this.isCartExpired();
            if (isExpired) {
                await this.clearCart();
                return [];
            }

            const db = await this.init();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readonly');
                const store = transaction.objectStore(CART_STORE);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const items = event.target.result.filter(item => item.uniqueKey !== CART_META_KEY);

                    const cartItems = items.map(item => ({
                        id: item.productId,
                        colorCode: item.colorCode,
                        storageCode: item.storageCode,
                        brand: item.brand,
                        model: item.model,
                        img: item.img
                    }));

                    resolve(cartItems);
                };

                request.onerror = (event) => {
                    console.error('Error obteniendo carrito:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en getCart:', error);
            return [];
        }
    },

    async clearCart() {
        try {
            const db = await this.init();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readwrite');
                const store = transaction.objectStore(CART_STORE);
                const request = store.clear();

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error('Error limpiando carrito:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error en clearCart:', error);
            return false;
        }
    },

    async isItemInCart(item) {
        try {
            const currentCart = await this.getCart();
            return currentCart.some(cartItem =>
                cartItem.id === item.id &&
                cartItem.colorCode === item.colorCode &&
                cartItem.storageCode === item.storageCode
            );
        } catch (error) {
            console.error('Error al verificar si el item está en el carrito:', error);
            return false;
        }
    },

    async addItemToCart(item) {
        try {
            const isDuplicate = await this.isItemInCart(item);

            if (isDuplicate) {
                console.log('Item duplicado, no se añadirá:', item);
                return false;
            }

            const currentCart = await this.getCart();
            const updatedCart = [...currentCart, item];
            return this.saveCart(updatedCart);
        } catch (error) {
            console.error('Error al añadir item al carrito:', error);
            return false;
        }
    },

    async removeItemFromCart(index) {
        try {
            const currentCart = await this.getCart();

            if (index >= 0 && index < currentCart.length) {
                currentCart.splice(index, 1);
                return this.saveCart(currentCart);
            }

            return false;
        } catch (error) {
            console.error('Error al eliminar item del carrito:', error);
            return false;
        }
    }
};

export default CartCache;