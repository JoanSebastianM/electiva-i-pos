export type Role = 'admin' | 'cajero';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName?: string | null;
  price: number;
  stock: number;
  lowStock?: boolean;
  inventoryStatus?: 'agotado' | 'bajo' | 'ok';
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

export interface RecipeItem {
  id?: number;
  productId?: number;
  ingredientId: number;
  quantity: number;
  ingredientName?: string;
  unit?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: Role | string;
  active: number;
  createdAt?: string;
}

export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName?: string;
}

export interface Sale {
  id: number;
  customerId: number | null;
  userId?: number | null;
  createdAt: string;
  total: number;
  items?: SaleItem[];
  productName?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface ApiError {
  error: string;
}

export interface AuthResponse {
  user: User;
}

export interface CategoryPayload {
  name: string;
}

export interface IngredientPayload {
  name: string;
  unit: string;
  stock: number;
}

export interface CustomerPayload {
  name: string;
  phone: string | null;
}

export interface ProductPayload {
  name: string;
  categoryId: number | null;
  price: number;
  stock: number;
}

export interface RecipePayload {
  items: Array<{ ingredientId: number; quantity: number }>;
}

export interface SalePayload {
  productId: number;
  quantity: number;
  customerId?: number | null;
}

export interface UserPayload {
  username: string;
  name: string;
  role: Role | string;
  password?: string;
  active?: number;
}
