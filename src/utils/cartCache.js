// Tiempo de expiración de la caché: 1 hora en milisegundos
const CACHE_EXPIRY = 60 * 60 * 1000;

// Configuración de la base de datos IndexedDB
const DB_NAME = 'CartCacheDB';
const DB_VERSION = 2;
const CART_STORE = 'cart';
const CART_META_KEY = 'cart_meta';

// Implementación de caché del carrito usando IndexedDB
const CartCache = {
    _db: null,

    // Inicializa la conexión a IndexedDB
    async init() {
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            // Maneja error al abrir la base de datos
            request.onerror = (event) => {
                console.error('Error al abrir IndexedDB para el carrito:', event.target.error);
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

                // Recrear store si ya existe
                if (db.objectStoreNames.contains(CART_STORE)) {
                    db.deleteObjectStore(CART_STORE);
                }

                // Crear almacén con clave única para productos
                const store = db.createObjectStore(CART_STORE, {
                    keyPath: 'uniqueKey',
                    autoIncrement: false
                });

                // Índices para búsquedas
                store.createIndex('productId', 'productId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            };
        });
    },

    // Verifica si la caché del carrito ha expirado
    async isCartExpired() {
        try {
            const db = await this.init();
            return new Promise((resolve) => {
                const transaction = db.transaction(CART_STORE, 'readonly');
                const store = transaction.objectStore(CART_STORE);
                const request = store.get(CART_META_KEY);

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
            console.error('Error verificando expiración del carrito:', error);
            return true;
        }
    },

    // Guarda todos los elementos del carrito
    async saveCart(cartItems) {
        try {
            const db = await this.init();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(CART_STORE, 'readwrite');
                const store = transaction.objectStore(CART_STORE);
                const timestamp = new Date().getTime();

                // Limpia los datos existentes
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    let itemsProcessed = 0;

                    // Guarda los metadatos con timestamp
                    store.put({
                        uniqueKey: CART_META_KEY,
                        timestamp: timestamp
                    });

                    // Si no hay elementos, termina
                    if (cartItems.length === 0) {
                        resolve(true);
                        return;
                    }

                    // Recorre y guarda cada elemento
                    cartItems.forEach((item) => {
                        // Clave única combinando id y opciones
                        const uniqueKey = `${item.id}-${item.colorCode}-${item.storageCode}`;

                        const request = store.add({
                            ...item,
                            uniqueKey: uniqueKey,
                            productId: item.id,
                            timestamp: timestamp
                        });

                        // Cuenta elementos procesados para resolver promesa
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

    // Obtiene todos los elementos del carrito
    async getCart() {
        try {
            // Verifica si la caché expiró
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
                    // Filtra los metadatos y devuelve solo los productos
                    const items = event.target.result.filter(item => item.uniqueKey !== CART_META_KEY);

                    // Mapea a estructura simplificada
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

    // Vacía el carrito
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

    // Verifica si un elemento ya existe en el carrito
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

    // Añade un nuevo elemento al carrito
    async addItemToCart(item) {
        try {
            // Evita duplicados
            const isDuplicate = await this.isItemInCart(item);

            if (isDuplicate) {
                console.log('Item duplicado, no se añadirá:', item);
                return false;
            }

            // Obtiene carrito actual y añade el nuevo elemento
            const currentCart = await this.getCart();
            const updatedCart = [...currentCart, item];
            return this.saveCart(updatedCart);
        } catch (error) {
            console.error('Error al añadir item al carrito:', error);
            return false;
        }
    },

    // Elimina un elemento por su índice
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