import { Injectable } from '@angular/core';
import { Category, Product, Config } from './types';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  fetch_config(): Config {
    return {title: "Sample snack bar", terminal: "Terminal #42"};
  }

  list_categories(): Category[] {
    return [
      {id: 1, name: "Cold Drinks"},
      {id: 2, name: "Hot Drinks"},
      {id: 3, name: "Cold Food"},
      {id: 4, name: "Hot Food"},
    ];
  }

  list_products(cat: Category): Product[] {
    return [
      {id: 1,  category: cat, name: "Griled corn", desc: "Yellow", price: 5, photo: "https://source.unsplash.com/4u_nRgiLW3M/600x600"},
      {id: 2,  category: cat, name: "Ranch Burger", desc: "With garlic", price: 10, photo: "https://source.unsplash.com/sc5sTPMrVfk/600x600"},
      {id: 3,  category: cat, name: "Pizza Bacon", desc: "Why not?", price: 15, photo: "https://source.unsplash.com/MNtag_eXMKw/600x600"},
      {id: 4,  category: cat, name: "Stuffed flank steak", desc: "Without fish", price: 12.5, photo: "https://source.unsplash.com/vzX2rgUbQXM/600x600"},
    ];
  }
}
