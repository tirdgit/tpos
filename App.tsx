
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductWithStock, OrderItem, User, CompletedOrder, PaymentMethod, Branch, Shift, Product } from './types';
import ProductCard from './components/ProductCard';
import OrderSummary from './components/OrderSummary';
import Modal from './components/Modal';
import ProductForm from './components/ProductForm';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import LoginPage from './components/LoginPage';
import ConfirmModal from './components/ConfirmModal';
import RestockModal from './components/RestockModal';
import UserManagementModal from './components/UserManagementModal';
import BranchSelectionModal from './components/BranchSelectionModal';
import BranchManagementModal from './components/BranchManagementModal';
import ShiftModal from './components/ShiftModal';
import { PlusIcon, UserIcon, LogoutIcon, ShoppingCartIcon, UsersIcon, BranchIcon, ClockIcon, SyncIcon } from './components/icons';
import * as api from './api';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithStock | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isBranchManagementModalOpen, setIsBranchManagementModalOpen] = useState(false);
  const [isBranchSelectionModalOpen, setIsBranchSelectionModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [latestCompletedOrder, setLatestCompletedOrder] = useState<CompletedOrder | null>(null);
  
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState<ProductWithStock | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [syncStatus, setSyncStatus] = useState<string>('Ready');

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        const [allUsers, allBranches, storedUser, storedBranch, storedOrder] = await Promise.all([
          api.getUsers(),
          api.getBranches(),
          api.getCurrentUser(),
          api.getCurrentBranch(),
          api.getCurrentOrder(),
        ]);
        
        setUsers(allUsers);
        setBranches(allBranches);

        if (storedUser && allUsers.some(u => u.id === storedUser.id)) {
            setCurrentUser(storedUser);
            if(storedBranch && allBranches.some(b => b.id === storedBranch.id) && storedUser.branchIds.includes(storedBranch.id)) {
                setCurrentBranch(storedBranch);
            }
        }
        if (storedOrder) setOrderItems(storedOrder);

      } catch (error) {
        console.error("Failed to load data from API", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch branch-specific data when branch changes
  useEffect(() => {
      const loadBranchData = async () => {
          if (currentBranch && currentUser) {
              const [branchProducts, userActiveShift] = await Promise.all([
                  api.getProducts(currentBranch.id),
                  api.getActiveShiftForUser(currentUser.id, currentBranch.id)
              ]);
              setProducts(branchProducts);
              setActiveShift(userActiveShift);
              if (!userActiveShift) {
                  setIsShiftModalOpen(true);
              }
          } else {
              setProducts([]);
          }
      };
      loadBranchData();
  }, [currentBranch, currentUser]);


  // Persist session state
  useEffect(() => {
    if (isLoading) return;
    api.setCurrentUser(currentUser).catch(e => console.error("Failed to save current user", e));
    api.setCurrentBranch(currentBranch).catch(e => console.error("Failed to save current branch", e));
  }, [currentUser, currentBranch, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    api.setCurrentOrder(orderItems).catch(e => console.error("Failed to save order items", e));
  }, [orderItems, isLoading]);

  const isAdmin = useMemo(() => currentUser?.role === 'Admin', [currentUser]);
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const orderTotal = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = orderItems.reduce((acc, item) => acc + (item.price * item.quantity * (item.taxRate || 0)), 0);
    return subtotal + tax;
  }, [orderItems]);

  const totalOrderItems = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [orderItems]);

  const handleOpenModal = (product: ProductWithStock | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };
  
  const handleLogin = async (username: string, password: string): Promise<User | null> => {
    const user = await api.login(username, password);
    if (user) {
        const { password, ...userToStore } = user;
        setCurrentUser(userToStore);
        if (user.branchIds.length === 1) {
            const branch = branches.find(b => b.id === user.branchIds[0]);
            if (branch) setCurrentBranch(branch);
        } else if (user.branchIds.length > 1) {
            setIsBranchSelectionModalOpen(true);
        } else {
            alert("This user is not assigned to any branch.");
            setCurrentUser(null);
            return null;
        }
        return userToStore;
    }
    return null;
  };
  
  const handleSelectBranch = (branch: Branch) => {
      setCurrentBranch(branch);
      setIsBranchSelectionModalOpen(false);
  }

  const handleLogout = () => {
      setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    if (activeShift) await handleEndShift();
    setCurrentUser(null);
    setCurrentBranch(null);
    setActiveShift(null);
    setOrderItems([]);
    await api.setCurrentUser(null);
    await api.setCurrentOrder([]);
    await api.setCurrentBranch(null);
    setIsLogoutModalOpen(false);
  };

  // FIX: Update the function signature to correctly match the `onSubmit` prop of ProductForm.
  const handleFormSubmit = async (productData: Omit<Product, 'id'> & { id?: string; imageUrl?: string; stock: number; }) => {
    if (!currentBranch) return;
    setIsSubmitting(true);
    try {
        const savedProduct = await api.saveProduct(productData, currentBranch.id);
        const products = await api.getProducts(currentBranch.id);
        setProducts(products);
        handleCloseModal();
    } catch(error) {
        console.error("Failed to save product", error);
        alert("Error: Could not save product.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if(window.confirm('Are you sure you want to delete this product?')){
        setIsSubmitting(true);
        try {
            await api.deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
            setOrderItems(orderItems.filter(item => item.id !== productId));
        } catch(error) {
            console.error("Failed to delete product", error);
            alert("Error: Could not delete product.");
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  // FIX: Update function signature to not expect `branchIds`. Add the current branch ID before saving.
  const handleAddUser = async (user: Omit<User, 'id' | 'branchIds'>) => {
    if (!currentBranch) {
        alert("Cannot add user: no active branch selected.");
        return;
    }
    setIsSubmitting(true);
    try {
        await api.saveUser({ ...user, branchIds: [currentBranch.id] });
        const allUsers = await api.getUsers();
        setUsers(allUsers);
    } catch(error) {
        console.error("Failed to add user", error);
    } finally {
        setIsSubmitting(false);
    }
  };

   const handleAddBranch = async (branchData: Omit<Branch, 'id'>) => {
    setIsSubmitting(true);
    try {
        await api.saveBranch(branchData);
        const allBranches = await api.getBranches();
        setBranches(allBranches);
    } catch(error) {
        console.error("Failed to add branch", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddToCart = useCallback((product: ProductWithStock) => {
    if (product.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(product.expiryDate);
        if (expiry < today) {
            alert(`"${product.name}" is expired and cannot be added to the order.`);
            return;
        }
    }
      
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevItems;
      } else if (product.stock > 0) {
        return [...prevItems, { ...product, quantity: 1 }];
      }
      return prevItems;
    });
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
     const productInStock = products.find(p => p.id === productId);
    if (!productInStock) return;

    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else if (newQuantity <= productInStock.stock) {
      setOrderItems(orderItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    } else {
        alert(`Only ${productInStock.stock} items available in stock.`);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };
  
  const handleCheckout = () => {
      if(orderItems.length > 0) {
          setIsOrderSummaryOpen(false);
          setIsPaymentModalOpen(true);
      }
  };

  const handleConfirmPayment = async (paymentDetails: { paymentMethod: PaymentMethod; cashReceived?: number }) => {
      if (!currentUser || !currentBranch || !activeShift) return;
      setIsSubmitting(true);
      const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const tax = orderItems.reduce((acc, item) => acc + (item.price * item.quantity * (item.taxRate || 0)), 0);
      const total = subtotal + tax;

      const completedOrder: Omit<CompletedOrder, 'id'> = {
          items: orderItems,
          subtotal,
          tax,
          total,
          paymentMethod: paymentDetails.paymentMethod,
          cashReceived: paymentDetails.cashReceived,
          changeDue: paymentDetails.cashReceived ? paymentDetails.cashReceived - total : undefined,
          cashier: currentUser,
          date: new Date().toLocaleString(),
          branchId: currentBranch.id,
          shiftId: activeShift.id,
      };
      
      try {
          const savedOrder = await api.submitOrder(completedOrder, currentBranch.id);
          setLatestCompletedOrder(savedOrder);
          
          const updatedProducts = await api.getProducts(currentBranch.id);
          setProducts(updatedProducts);

          setOrderItems([]);
          setIsPaymentModalOpen(false);
          setIsReceiptModalOpen(true);
      } catch(error) {
          console.error("Failed to submit order", error);
          alert("Error: Could not process payment.");
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const handleStartShift = async () => {
    if (!currentUser || !currentBranch) return;
    const newShift = await api.startShift(currentUser.id, currentBranch.id);
    setActiveShift(newShift);
    setIsShiftModalOpen(false);
  }

  const handleEndShift = async () => {
      if (!activeShift) return;
      await api.endShift(activeShift.id);
      setActiveShift(null);
      alert("Shift ended. You will now be logged out.");
      confirmLogout();
  }

  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    setLatestCompletedOrder(null);
  };

  const handleOpenRestockModal = (product: ProductWithStock) => {
    setRestockingProduct(product);
    setIsRestockModalOpen(true);
  };

  const handleCloseRestockModal = () => {
    setRestockingProduct(null);
    setIsRestockModalOpen(false);
  };

  const handleConfirmRestock = async (productId: string, quantityToAdd: number) => {
    if (!currentBranch) return;
    setIsSubmitting(true);
    try {
        await api.restockProduct(productId, quantityToAdd, currentBranch.id);
        const updatedProducts = await api.getProducts(currentBranch.id);
        setProducts(updatedProducts);
        handleCloseRestockModal();
    } catch(error) {
        console.error("Failed to restock product", error);
        alert("Error: Could not restock product.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    try {
        await api.syncDataToServer();
        setSyncStatus(`Last synced: ${new Date().toLocaleTimeString()}`);
    } catch (e) {
        setSyncStatus('Sync failed');
        console.error(e);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">Loading POS System...</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!currentBranch) {
      const userBranches = branches.filter(b => currentUser.branchIds.includes(b.id));
      return <BranchSelectionModal isOpen={true} branches={userBranches} onSelectBranch={handleSelectBranch} />;
  }
  
  if (!activeShift) {
      return <ShiftModal isOpen={true} onStartShift={handleStartShift} />;
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">POS System</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium">{currentUser.name} ({currentUser.role})</span>
                    </div>
                    {isAdmin && (
                        <>
                         <button onClick={() => setIsUserManagementModalOpen(true)} className="flex items-center space-x-2 text-sm" title="Manage Users"><UsersIcon className="w-5 h-5" /></button>
                         <button onClick={() => setIsBranchManagementModalOpen(true)} className="flex items-center space-x-2 text-sm" title="Manage Branches"><BranchIcon className="w-5 h-5" /></button>
                         <button onClick={handleSync} className="flex items-center space-x-2 text-sm" title={syncStatus}><SyncIcon className="w-5 h-5" /></button>
                         <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 bg-cyan-600 text-white px-3 py-1.5 rounded-lg hover:bg-cyan-700 text-sm">
                             <PlusIcon className="w-4 h-4" />
                             <span>New Product</span>
                         </button>
                        </>
                    )}
                    <button onClick={handleLogout} className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Logout">
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t pt-2 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <BranchIcon className="w-4 h-4"/>
                    <span>Branch: <strong>{currentBranch.name}</strong></span>
                </div>
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4"/>
                    <span>Shift Started: <strong>{new Date(activeShift.startTime).toLocaleTimeString()}</strong></span>
                </div>
            </div>
        </div>
      </header>


      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
         <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                            selectedCategory === category
                                ? 'bg-cyan-600 text-white shadow'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-cyan-100 dark:hover:bg-gray-600'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onEdit={handleOpenModal}
              onDelete={handleDeleteProduct}
              onRestock={handleOpenRestockModal}
              isAdmin={isAdmin}
            />
          ))}
        </div>
         {products.length > 0 && filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No products found in "{selectedCategory}".</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Select another category to continue.</p>
            </div>
        )}
         {products.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No products in this branch.</h2>
                {isAdmin && <p className="text-gray-500 dark:text-gray-400 mt-2">Click "New Product" to add the first item.</p>}
            </div>
        )}
      </main>

      {orderItems.length > 0 && (
         <button 
            onClick={() => setIsOrderSummaryOpen(true)}
            className="fixed bottom-6 right-6 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-transform transform hover:scale-110 z-20"
            aria-label={`View order with ${totalOrderItems} items`}
         >
             <ShoppingCartIcon className="w-8 h-8"/>
             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                 {totalOrderItems}
             </span>
         </button>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <ProductForm onSubmit={handleFormSubmit} initialData={editingProduct} onClose={handleCloseModal} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={isOrderSummaryOpen} onClose={() => setIsOrderSummaryOpen(false)} title="Order Summary" size="lg">
        <OrderSummary 
            orderItems={orderItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
        />
      </Modal>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={orderTotal}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isSubmitting}
      />
      
      <Modal isOpen={isReceiptModalOpen} onClose={handleCloseReceipt} title="Receipt" size="sm">
        {latestCompletedOrder && (
          <div>
            <Receipt order={latestCompletedOrder} branch={currentBranch} />
            <div className="flex justify-between mt-6 pt-4 border-t dark:border-gray-600 no-print">
                <button onClick={handleCloseReceipt} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 w-full">
                    New Order
                </button>
            </div>
          </div>
        )}
      </Modal>

       {isAdmin && (
        <>
            <UserManagementModal
                isOpen={isUserManagementModalOpen}
                onClose={() => setIsUserManagementModalOpen(false)}
                users={users}
                onAddUser={handleAddUser}
            />
            <BranchManagementModal
                isOpen={isBranchManagementModalOpen}
                onClose={() => setIsBranchManagementModalOpen(false)}
                branches={branches}
                onAddBranch={handleAddBranch}
            />
        </>
      )}

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message={`Are you sure you want to end your shift and log out? Any items in the current order will be cleared.`}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={handleCloseRestockModal}
        product={restockingProduct}
        onConfirmRestock={handleConfirmRestock}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};

export default App;