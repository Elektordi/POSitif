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
      {id: 1, name: "Misc."},
      {id: 2, name: "Cold Drinks"},
      {id: 3, name: "Hot Drinks"},
    ];
  }

  list_products(cat: Category): Product[] {
    if(cat.id == 1) return [
      {id: 1, category: cat, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 2, category: cat, name: "Cup (return)", desc: "Max 3 per person.", price: -1, photo: "/assets/products/cup-return.jpg"},
    ];
    if(cat.id == 2) return [
      {id: 1, category: cat, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 20, category: cat, name: "Blond Beer", desc: "Belgian beer, 8%", price: 3, photo: "/assets/products/beer.jpg"},
      {id: 21, category: cat, name: "White Beer", desc: "Belgian beer, 7%", price: 3, photo: "/assets/products/beerwhite.jpg"},
    ];
    if(cat.id == 3) return [
      {id: 1, category: cat, name: "Cup", desc: "Returnable", price: 1, photo: "/assets/products/cup.jpg"},
      {id: 30, category: cat, name: "Coffee", desc: "15cl", price: 0.5, photo: "/assets/products/coffee.jpg"},
      {id: 31, category: cat, name: "Tea", desc: "30cl\nBlack or Green tea", price: 0.5, photo: "/assets/products/tea.jpg"},
    ];
    return [];
  }
}
