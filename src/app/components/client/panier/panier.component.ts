import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../../services/cart.service';
import { ApiService } from '../../../services/api.service';
import { Order, OrderItem } from '../../../models/models';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class CartCheckoutComponent implements OnInit {

  cartItems: CartItem[] = [];
  promoCode: string = '';
  promoError: string | null = null;
  promoSuccess: string | null = null;
  discountPercentage: number = 0;

  // Checkout Fields
  clientName: string = 'Sophie Martin';
  clientEmail: string = 'sophie.martin@example.com';
  clientPhone: string = '06 12 34 56 78';
  shippingAddress: string = '15 Rue de la Paix, 75002 Paris';

  orderSubmitted: boolean = false;
  createdOrder: Order | null = null;
  ordersList: Order[] = [];

  constructor(
    public cartService: CartService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.cartService.items$.subscribe(items => this.cartItems = items);
    this.cartService.promoDiscount$.subscribe(d => this.discountPercentage = d);
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getOrders().subscribe(data => {
      this.ordersList = data;
    });
  }

  updateQuantity(index: number, quantity: number): void {
    this.cartService.updateQuantity(index, quantity);
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  applyPromo(): void {
    if (!this.promoCode) return;
    this.promoError = null;
    this.promoSuccess = null;

    this.apiService.validatePromoCode(this.promoCode).subscribe({
      next: (promo) => {
        this.cartService.applyDiscountPercentage(promo.discountPercentage);
        this.promoSuccess = `Code "${promo.code}" appliqué ! -${promo.discountPercentage}% de réduction.`;
      },
      error: (err) => {
        this.promoError = 'Code promo invalide ou expiré.';
      }
    });
  }

  submitOrder(): void {
    if (this.cartItems.length === 0) return;

    const order: Order = {
      orderReference: `OPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      clientPhone: this.clientPhone,
      shippingAddress: this.shippingAddress,
      totalAmount: this.cartService.getTotal(),
      status: 'EN_PREPARATION',
      items: this.cartService.toOrderItems()
    };

    this.apiService.createOrder(order).subscribe({
      next: (created) => {
        this.createdOrder = created;
        this.orderSubmitted = true;
        this.cartService.clearCart();
        this.loadOrders();
      },
      error: (err) => console.error('Order creation failed', err)
    });
  }
}
