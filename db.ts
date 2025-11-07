import { Product, OrderItem, User, CompletedOrder, Branch, Shift, ProductStock } from './types';

const DB_NAME = 'pos-db';
const DB_VERSION = 5; // Incremented version
const STORES = {
  PRODUCTS: 'products',
  SALES_HISTORY: 'salesHistory',
  APP_STATE: 'appState', // For key-value pairs
  USERS: 'users',
  BRANCHES: 'branches',
  SHIFTS: 'shifts',
  PRODUCT_STOCK: 'productStock',
};

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database error:', request.error);
      reject('Error opening database');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction as IDBTransaction;

      // Use a switch statement with fall-through for robust, ordered migrations.
      // This is the standard pattern for IndexedDB versioning.
      switch (event.oldVersion) {
        case 0:
          // Initial setup for a new database (version 0 -> 1)
          dbInstance.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
          dbInstance.createObjectStore(STORES.SALES_HISTORY, { keyPath: 'id' });
          dbInstance.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
        // fallthrough
        case 1: // Migration to version 2
        case 2: // Migration to version 3
          if (!dbInstance.objectStoreNames.contains(STORES.USERS)) {
            dbInstance.createObjectStore(STORES.USERS, { keyPath: 'id' });
          }
        // fallthrough
        case 3:
          // Migration to version 4: Add taxRate to existing products
          { // Use block scope to avoid redeclaration errors
            const productStore = transaction.objectStore(STORES.PRODUCTS);
            productStore.getAll().onsuccess = (getAllEvent) => {
              const products = (getAllEvent.target as IDBRequest).result as Product[];
              products.forEach(product => {
                if (product.taxRate === undefined) {
                  product.taxRate = 0.07;
                }
                productStore.put(product);
              });
            };
          }
        // fallthrough
        case 4:
          // Migration to version 5: Add branches, shifts, stock management
          { // Use block scope
            if (!dbInstance.objectStoreNames.contains(STORES.BRANCHES)) {
              dbInstance.createObjectStore(STORES.BRANCHES, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORES.SHIFTS)) {
              dbInstance.createObjectStore(STORES.SHIFTS, { keyPath: 'id' });
            }
            if (!dbInstance.objectStoreNames.contains(STORES.PRODUCT_STOCK)) {
              dbInstance.createObjectStore(STORES.PRODUCT_STOCK, { keyPath: 'id' });
            }
            
            // Create a default branch
            const defaultBranch: Branch = { id: 'main-branch', name: 'Main Branch' };
            const branchStore = transaction.objectStore(STORES.BRANCHES);
            branchStore.add(defaultBranch);

            // Migrate product stock
            const productStore = transaction.objectStore(STORES.PRODUCTS);
            const stockStore = transaction.objectStore(STORES.PRODUCT_STOCK);
            productStore.getAll().onsuccess = (e) => {
                const products = (e.target as IDBRequest).result as (Product & { stock?: number })[];
                products.forEach(p => {
                    if (typeof p.stock === 'number') {
                        const newStock: ProductStock = {
                            id: `${p.id}-${defaultBranch.id}`,
                            productId: p.id,
                            branchId: defaultBranch.id,
                            stock: p.stock,
                        };
                        stockStore.add(newStock);
                        delete p.stock; // remove old stock property
                        productStore.put(p);
                    }
                });
            };
            
            // Assign users to default branch
            const userStore = transaction.objectStore(STORES.USERS);
            userStore.getAll().onsuccess = (e) => {
                const users = (e.target as IDBRequest).result as User[];
                users.forEach(u => {
                    if (!u.branchIds) {
                        u.branchIds = [defaultBranch.id];
                    }
                    userStore.put(u);
                });
            };
          }
      }
    };
  });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const putAll = <T>(storeName: string, items: T[]): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear the store before adding new items
    store.clear();

    items.forEach(item => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getKeyValue = async <T>(key: string): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(STORES.APP_STATE, 'readonly');
        const store = transaction.objectStore(STORES.APP_STATE);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            resolve(request.result ? request.result.value : undefined);
        };
    });
};

export const setKeyValue = async (key: string, value: any): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const db = await initDB();
        const transaction = db.transaction(STORES.APP_STATE, 'readwrite');
        const store = transaction.objectStore(STORES.APP_STATE);
        const request = store.put({ key, value });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};