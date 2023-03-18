export interface Config {
  title: string;
  terminal: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  category: Category;
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
}