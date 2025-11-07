
import { Product, OrderItem, User, CompletedOrder, ProductWithStock, Branch, Shift, ProductStock } from './types';
import * as db from './db';

const MOCK_LATENCY = 300; 

const populateInitialData = async () => {
    let branches = await db.getAll<Branch>('branches');
    if (branches.length === 0) {
        const defaultBranch = { id: 'main-branch', name: 'Main Branch' };
        await db.putAll('branches', [defaultBranch]);
        branches = [defaultBranch];
    }
    const mainBranchId = branches[0].id;

    let users = await db.getAll<User>('users');
    if (users.length === 0) {
        const defaultUsers: User[] = [
            { id: 'user1', name: 'Alice', password: 'password123', role: 'Admin', branchIds: [mainBranchId] },
            { id: 'user2', name: 'Bob', password: 'password456', role: 'Cashier', branchIds: [mainBranchId] },
        ];
        await db.putAll('users', defaultUsers);
    }
};


// --- Authentication ---
export const login = (username: string, password: string): Promise<User | null> => {
  return new Promise(async (resolve) => {
    await populateInitialData(); // Ensure defaults exist
    const users = await db.getAll<User>('users');
    setTimeout(() => {
      const user = users.find(u => u.name.toLowerCase() === username.toLowerCase() && u.password === password);
      resolve(user || null);
    }, MOCK_LATENCY);
  });
};

// --- Users ---
export const getUsers = (): Promise<User[]> => {
    return new Promise(async (resolve) => {
        const users = await db.getAll<User>('users');
        const usersWithoutPasswords = users.map(({ password, ...user }) => user);
        setTimeout(() => resolve(usersWithoutPasswords), MOCK_LATENCY / 2);
    });
};

export const saveUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise(async (resolve) => {
        const users = await db.getAll<User>('users');
        const newUser: User = {
            id: new Date().toISOString(),
            ...userData,
        };
        await db.putAll('users', [...users, newUser]);
        setTimeout(() => resolve(newUser), MOCK_LATENCY);
    });
};

// --- Branches ---
export const getBranches = (): Promise<Branch[]> => db.getAll<Branch>('branches');

export const saveBranch = (branchData: Omit<Branch, 'id'>): Promise<Branch> => {
    return new Promise(async (resolve) => {
        const branches = await db.getAll<Branch>('branches');
        const newBranch: Branch = { id: new Date().toISOString(), ...branchData };
        await db.putAll('branches', [...branches, newBranch]);
        setTimeout(() => resolve(newBranch), MOCK_LATENCY);
    });
};


// --- Products ---
export const getProducts = (branchId: string): Promise<ProductWithStock[]> => {
    return new Promise(async (resolve) => {
        let products = await db.getAll<Product>('products');
        
        if (products.length === 0) {
            const today = new Date();
            const expiredDate = new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0];
            const soonDate = new Date(today.setDate(today.getDate() + 10)).toISOString().split('T')[0]; // Reset date to get +5 from original
            const futureDate = new Date(today.setDate(today.getDate() + 95)).toISOString().split('T')[0]; // and +90 from original

             const defaultProducts: Product[] = [
                { id: '1', name: 'Espresso', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1511920183353-3c9c9b0a0a57?w=400&q=80', category: 'Coffee', barcode: '10001', taxRate: 0.07, expiryDate: futureDate },
                { id: '2', name: 'Latte', price: 3.50, imageUrl: 'https://images.unsplash.com/photo-1561882468-91101f2e5f87?w=400&q=80', category: 'Coffee', barcode: '10002', taxRate: 0.07 }, // No expiry
                { id: '3', name: 'Cappuccino', price: 3.50, imageUrl: 'https://images.unsplash.com/photo-1557006021-b85128a35635?w=400&q=80', category: 'Coffee', barcode: '10003', taxRate: 0.07, expiryDate: soonDate },
                { id: '4', name: 'Croissant', price: 2.75, imageUrl: 'https://images.unsplash.com/photo-1587241321921-91a834d6d194?w=400&q=80', category: 'Bakery', barcode: '20001', taxRate: 0.07, expiryDate: expiredDate },
                { id: '5', name: 'Muffin', price: 2.25, imageUrl: 'https://images.unsplash.com/photo-1550617931-e222d787d22f?w=400&q=80', category: 'Bakery', barcode: '20002', taxRate: 0.07, expiryDate: soonDate },
                { id: '6', name: 'Iced Coffee', price: 3.00, imageUrl: 'https://images.unsplash.com/photo-1517701550927-4e4af3a3d508?w=400&q=80', category: 'Drinks', barcode: '30001', taxRate: 0.07, expiryDate: futureDate },
            ];
            await db.putAll('products', defaultProducts);
            products = defaultProducts;

            // Create initial stock for default products
            const defaultStock: ProductStock[] = defaultProducts.map(p => ({
                id: `${p.id}-${branchId}`,
                productId: p.id,
                branchId: branchId,
                stock: p.id === '6' ? 0 : (p.id === '2' || p.id === '4' ? 10 : 50),
            }));
            await db.putAll('productStock', defaultStock);
        }

        const allStock = await db.getAll<ProductStock>('productStock');
        const branchStock = allStock.filter(s => s.branchId === branchId);
        
        const productsWithStock: ProductWithStock[] = products.map(p => {
            const stockInfo = branchStock.find(s => s.productId === p.id);
            return { ...p, stock: stockInfo ? stockInfo.stock : 0 };
        });

        setTimeout(() => resolve(productsWithStock.sort((a,b) => a.name.localeCompare(b.name))), MOCK_LATENCY / 2);
    });
};

// FIX: Update function signature to accept stock from the product form.
export const saveProduct = (productData: Omit<Product, 'id'> & { id?: string; imageUrl?: string; stock: number }, branchId: string): Promise<Product> => {
    return new Promise(async (resolve) => {
        const products = await db.getAll<Product>('products');
        const allStock = await db.getAll<ProductStock>('productStock');
        let savedProduct: Product;
        const { stock, ...coreProductData } = productData;

        if (coreProductData.id) {
            // Update existing product
            const existingProduct = products.find(p => p.id === coreProductData.id)!;
            savedProduct = { ...existingProduct, ...coreProductData };
            const updatedProducts = products.map(p => p.id === coreProductData.id ? savedProduct : p);
            await db.putAll('products', updatedProducts);
        } else {
            // Create new product
            savedProduct = {
                id: new Date().toISOString(),
                ...coreProductData,
                imageUrl: coreProductData.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(coreProductData.name)}/${Math.floor(Math.random() * 1000)}/400/300`,
            };
            await db.putAll('products', [savedProduct, ...products]);
            // Create initial stock record for this branch
            const newStock: ProductStock = {
                id: `${savedProduct.id}-${branchId}`,
                productId: savedProduct.id,
                branchId: branchId,
                // FIX: Use the typed stock property from productData instead of an untyped 'any' cast.
                stock: stock || 0,
            };
            await db.putAll('productStock', [...allStock, newStock]);
        }
        setTimeout(() => resolve(savedProduct), MOCK_LATENCY);
    });
};

export const deleteProduct = (productId: string): Promise<void> => {
    return new Promise(async (resolve) => {
        const products = await db.getAll<Product>('products');
        const allStock = await db.getAll<ProductStock>('productStock');
        
        await db.putAll('products', products.filter(p => p.id !== productId));
        await db.putAll('productStock', allStock.filter(s => s.productId !== productId));
        
        setTimeout(() => resolve(), MOCK_LATENCY);
    });
};

export const restockProduct = (productId: string, quantityToAdd: number, branchId: string): Promise<ProductStock> => {
    return new Promise(async (resolve) => {
        const allStock = await db.getAll<ProductStock>('productStock');
        let updatedStockItem: ProductStock | undefined;
        const updatedStocks = allStock.map(s => {
            if (s.productId === productId && s.branchId === branchId) {
                updatedStockItem = { ...s, stock: s.stock + quantityToAdd };
                return updatedStockItem;
            }
            return s;
        });
        await db.putAll('productStock', updatedStocks);
        setTimeout(() => resolve(updatedStockItem!), MOCK_LATENCY);
    });
};


// --- Sales ---
export const submitOrder = (orderData: Omit<CompletedOrder, 'id'>, branchId: string): Promise<CompletedOrder> => {
    return new Promise(async (resolve) => {
        const order: CompletedOrder = { id: new Date().toISOString(), ...orderData };
        // Update product stock in the database
        const allStock = await db.getAll<ProductStock>('productStock');
        const updatedStocks = allStock.map(s => {
             if (s.branchId !== branchId) return s;
            const orderItem = order.items.find(item => item.id === s.productId);
            if (orderItem) {
                return { ...s, stock: s.stock - orderItem.quantity };
            }
            return s;
        });
        await db.putAll('productStock', updatedStocks);

        // Save sales history
        const history = await db.getAll<CompletedOrder>('salesHistory');
        await db.putAll('salesHistory', [order, ...history]);

        setTimeout(() => resolve(order), MOCK_LATENCY);
    });
};

// --- Shifts ---
export const startShift = (cashierId: string, branchId: string): Promise<Shift> => {
    return new Promise(async (resolve) => {
        const shifts = await db.getAll<Shift>('shifts');
        const newShift: Shift = {
            id: new Date().toISOString(),
            cashierId,
            branchId,
            startTime: new Date().toISOString(),
        };
        await db.putAll('shifts', [...shifts, newShift]);
        setTimeout(() => resolve(newShift), MOCK_LATENCY);
    });
};

export const endShift = (shiftId: string): Promise<Shift> => {
    return new Promise(async (resolve) => {
        const shifts = await db.getAll<Shift>('shifts');
        let endedShift: Shift;
        const updatedShifts = shifts.map(s => {
            if (s.id === shiftId) {
                endedShift = { ...s, endTime: new Date().toISOString() };
                return endedShift;
            }
            return s;
        });
        await db.putAll('shifts', updatedShifts);
        setTimeout(() => resolve(endedShift!), MOCK_LATENCY);
    });
};

export const getActiveShiftForUser = (cashierId: string, branchId: string): Promise<Shift | null> => {
    return new Promise(async (resolve) => {
        const shifts = await db.getAll<Shift>('shifts');
        const activeShift = shifts.find(s => 
            s.cashierId === cashierId && 
            s.branchId === branchId && 
            !s.endTime
        );
        resolve(activeShift || null);
    });
};


// --- Sync ---
export const syncDataToServer = async (): Promise<void> => {
    console.log('Starting data sync...');
    const lastSync = await db.getKeyValue<string>('lastSyncTimestamp');
    const lastSyncTime = lastSync ? new Date(lastSync).getTime() : 0;
    
    const allSales = await db.getAll<CompletedOrder>('salesHistory');
    const allShifts = await db.getAll<Shift>('shifts');
    
    const newSales = allSales.filter(s => new Date(s.date).getTime() > lastSyncTime);
    const updatedShifts = allShifts.filter(s => new Date(s.startTime).getTime() > lastSyncTime || (s.endTime && new Date(s.endTime).getTime() > lastSyncTime));

    const payload = {
        sales: newSales,
        shifts: updatedShifts,
        syncTimestamp: new Date().toISOString()
    };
    
    // Simulate API call
    return new Promise((resolve) => {
        setTimeout(async () => {
            console.log('--- SIMULATED SERVER PAYLOAD ---');
            console.log(JSON.stringify(payload, null, 2));
            console.log('--- END OF PAYLOAD ---');
            
            await db.setKeyValue('lastSyncTimestamp', payload.syncTimestamp);
            console.log('Sync complete.');
            resolve();
        }, 1500); // Simulate network delay
    });
};


// --- App State (Session) ---
export const getCurrentUser = (): Promise<User | null> => db.getKeyValue<User>('currentUser');
export const setCurrentUser = (user: User | null): Promise<void> => db.setKeyValue('currentUser', user);
export const getCurrentBranch = (): Promise<Branch | null> => db.getKeyValue<Branch>('currentBranch');
export const setCurrentBranch = (branch: Branch | null): Promise<void> => db.setKeyValue('currentBranch', branch);
export const getCurrentOrder = (): Promise<OrderItem[]> => db.getKeyValue<OrderItem[]>('currentOrder').then(order => order || []);
export const setCurrentOrder = (orderItems: OrderItem[]): Promise<void> => db.setKeyValue('currentOrder', orderItems);