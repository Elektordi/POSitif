export interface Config {
  title: string;
  ref: string;
  enable_cash: boolean;
  enable_card: boolean;
  enable_check: boolean;
  enable_free: boolean;
}

export interface Category {
  id: number;
  name: string;
  products: Product[];
  display_order: number;
}

export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  photo?: { url:string; };
  display_order: number;
}

export interface OrderLine {
  product?: Product;
  qty: number;
  price: number;
  label: string;
}

export interface Order {
  lines: OrderLine[];
  total: number;
  refund: boolean;
  payment_method?: string;
  payment_infos?: string;
  payment_timestamp?: number;
  uid?: string;
}

export enum SyncStatus {
  DEFAULT = 0,
  OK = 1, // Orders buffer empty and last downlink ok
  WARNING = 2, // Orders buffer NOT empty OR last downlink KO
  ERROR = 3, // Orders buffer NOT empty and last downlink KO
}