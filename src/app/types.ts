export interface Config {
  title: string;
  store_id: string;
  terminal_id: string;
  api_key: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  photo?: string;
}

export interface Order {
  lines: {
    product: Product;
    qty: number;
  }[];
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
  WARNING = 2, // Orders buffer NOT empty and last downlink ok
  ERROR = 3, // Last downlink KO
}