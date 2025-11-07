
export interface Branch {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  branchId: string;
  startTime: string;
  endTime?: string;
}

export interface Product {
  id:string;
  name: string;
  price: number;
  // stock is now managed in ProductStock
  imageUrl: string;
  category: string;
  barcode?: string;
  taxRate?: number;
  expiryDate?: string;
}

export interface ProductWithStock extends Product {
    stock: number;
}

export interface ProductStock {
    id: string; // "productId-branchId"
    productId: string;
    branchId: string;
    stock: number;
}

export interface OrderItem extends ProductWithStock {
  quantity: number;
}

export type UserRole = 'Admin' | 'Cashier';

export interface User {
  id: string;
  name: string;
  password?: string; // Optional because we don't send it back to the client after login
  role: UserRole;
  branchIds: string[];
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'QR Code';

export interface CompletedOrder {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeDue?: number;
  cashier: User;
  date: string;
  branchId: string;
  shiftId: string;
}

export interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  // FIX: Change signature to not require branchIds from the modal. It will be handled by the parent component.
  onAddUser: (user: Omit<User, 'id' | 'branchIds'>) => Promise<void>;
}

export interface BranchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  onAddBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
}

export interface ShiftModalProps {
    isOpen: boolean;
    onStartShift: () => void;
}