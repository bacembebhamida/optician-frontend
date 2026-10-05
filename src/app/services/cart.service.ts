import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, OrderItem } from '../models/models';

export interface CartItem {
  product: Product;
  quantity: number;
  lensType: string;
  lensPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private promoDiscountSubject = new BehaviorSubject<number>(0);
  public promoDiscount$ = this.promoDiscountSubject.asObservable();

  addToCart(product: Product, lensType: string = 'Verres Standards (Anti-Reflet)', lensPrice: number = 0) {
    const current = [...this.itemsSubject.value];
    const existingIndex = current.findIndex(i => i.product.id === product.id && i.lensType === lensType);
    
    if (existingIndex > -1) {
      current[existingIndex].quantity += 1;
    } else {
      current.push({
        product,
        quantity: 1,
        lensType,
        lensPrice
      });
    }
    
    this.itemsSubject.next(current);
  }

  removeFromCart(index: number) {
    const current = [...this.itemsSubject.value];
    current.splice(index, 1);
    this.itemsSubject.next(current);
  }

  updateQuantity(index: number, quantity: number) {
    const current = [...this.itemsSubject.value];
    if (quantity <= 0) {
      current.splice(index, 1);
    } else {
      current[index].quantity = quantity;
    }
    this.itemsSubject.next(current);
  }

  applyDiscountPercentage(percent: number) {
    this.promoDiscountSubject.next(percent);
  }

  clearCart() {
    this.itemsSubject.next([]);
    this.promoDiscountSubject.next(0);
  }

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getSubtotal(): number {
    return this.itemsSubject.value.reduce((acc, item) => {
      return acc + (item.product.price + item.lensPrice) * item.quantity;
    }, 0);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = (subtotal * this.promoDiscountSubject.value) / 100;
    return Math.max(0, subtotal - discount);
  }

  toOrderItems(): OrderItem[] {
    return this.itemsSubject.value.map(item => ({
      productId: item.product.id || 0,
      productName: item.product.name,
      productCategory: item.product.category,
      unitPrice: item.product.price + item.lensPrice,
      quantity: item.quantity,
      lensType: item.lensType
    }));
  }
}
