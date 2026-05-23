import { Component, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../../../core/services/checkout/checkout.service';
import { PaymentService } from '../../../../core/services/payment/payment.service';
import { BasketStateService } from '../../../../core/services/cart/basket-state.service';
import { DeliveryMethod } from '../../../../shared/models/order';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-delivery',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './checkout-delivery.component.html'
})
export class CheckoutDeliveryComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private paymentService = inject(PaymentService);
  private basketState = inject(BasketStateService);
  private fb = inject(FormBuilder);

  deliveryMethods = signal<DeliveryMethod[]>([]);
  loading = signal(true);
  
  deliveryForm: FormGroup;

  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  constructor() {
    this.deliveryForm = this.fb.group({
      deliveryMethod: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadMethods();
  }

  loadMethods() {
    this.checkoutService.getDeliveryMethods().subscribe({
      next: (methods) => {
        console.log(methods);
        this.deliveryMethods.set(methods);
        this.loading.set(false);
        
        const current = this.checkoutService.deliveryMethod();
        if (current) {
          this.deliveryForm.patchValue({ deliveryMethod: current.id });
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectMethod(id: string) {
    this.deliveryForm.patchValue({ deliveryMethod: id });
    const method = this.deliveryMethods().find(m => m.id === id);
    if (method) {
      this.checkoutService.updateDeliveryMethod(method);
    }
  }

  proceed() {
    if (this.deliveryForm.valid) {
      this.createPaymentIntent();
    }
  }

  createPaymentIntent() {
    const basket = this.basketState.basket();
    const deliveryMethodId = this.deliveryForm.get('deliveryMethod')?.value;
    
    if (basket && deliveryMethodId) {
      this.loading.set(true);
      this.paymentService.createPaymentIntent(basket.id, deliveryMethodId).subscribe({
        next: () => {
          this.loading.set(false);
          this.next.emit();
        },
        error: (error) => {
          this.loading.set(false);
          console.error(error);
        }
      });
    }
  }
}
