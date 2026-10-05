import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OptiVisionService } from '../../../services/optivision.service';
import { CartItem, Order, Prescription } from '../../../models/optivision.models';

@Component({
  selector: 'app-cart-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart-checkout.component.html',
  styleUrls: ['./cart-checkout.component.css']
})
export class CartCheckoutComponent implements OnInit {

  cartItems: CartItem[] = [];
  prescriptions: Prescription[] = [];
  selectedPrescriptionId: number | null = null;

  isCheckoutStep: boolean = false;
  checkoutStep: number = 1; // 1: Informations, 2: Prescription, 3: Paiement

  // Form Fields
  fullName: string = 'Sonia Ben Ammar';
  email: string = 'sonia.benammar@optivision.tn';
  phone: string = '+216 22 456 789';
  address: string = 'Avenue Hédi Nouira, Ennasr 2, Ariana, Tunisie';

  paymentMethod: 'CARTE_BANCAIRE' | 'PAIEMENT_LIVRAISON' | 'KONNECT_FLOUCI' = 'PAIEMENT_LIVRAISON';

  promoCode: string = '';
  discountTnd: number = 0;
  promoApplied: boolean = false;

  orderSuccess: boolean = false;
  placedOrder: Order | null = null;

  constructor(private optiService: OptiVisionService) {}

  ngOnInit(): void {
    this.optiService.getCart().subscribe(items => {
      this.cartItems = items;
    });

    this.optiService.getPrescriptions().subscribe(prescs => {
      this.prescriptions = prescs;
      if (this.prescriptions.length > 0) this.selectedPrescriptionId = this.prescriptions[0].id;
    });
  }

  get subtotalTnd(): number {
    return this.cartItems.reduce((acc, item) => acc + item.totalPriceTnd, 0);
  }

  get shippingTnd(): number {
    return this.subtotalTnd >= 300 ? 0 : 7;
  }

  get grandTotalTnd(): number {
    return Math.max(0, this.subtotalTnd + this.shippingTnd - this.discountTnd);
  }

  removeItem(itemId: string): void {
    this.optiService.removeFromCart(itemId);
  }

  applyPromo(): void {
    if (this.promoCode.toUpperCase() === 'OPTI10') {
      this.discountTnd = Math.round(this.subtotalTnd * 0.1);
      this.promoApplied = true;
    }
  }

  startCheckout(): void {
    this.isCheckoutStep = true;
    this.checkoutStep = 1;
  }

  nextCheckoutStep(): void {
    if (this.checkoutStep < 3) this.checkoutStep++;
  }

  prevCheckoutStep(): void {
    if (this.checkoutStep > 1) this.checkoutStep--;
  }

  confirmOrder(): void {
    this.optiService.createOrder({
      paymentMethod: this.paymentMethod,
      deliveryAddress: this.address
    }).subscribe(order => {
      this.placedOrder = order;
      this.orderSuccess = true;
    });
  }
}
