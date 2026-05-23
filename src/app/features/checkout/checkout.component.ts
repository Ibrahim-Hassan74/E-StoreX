import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { OrderSummaryComponent } from './components/order-summary/order-summary.component';
import { CheckoutAddressComponent } from './components/checkout-address/checkout-address.component';
import { CheckoutDeliveryComponent } from './components/checkout-delivery/checkout-delivery.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    OrderSummaryComponent,
    CheckoutAddressComponent,
    CheckoutDeliveryComponent,
    CheckoutPaymentComponent,
    TranslateModule
  ],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent {
  currentStep = signal(1);
  checkoutService = inject(CheckoutService);

  nextStep() {
    this.currentStep.update(v => v + 1);
  }

  prevStep() {
    this.currentStep.update(v => Math.max(1, v - 1));
  }

  goToStep(step: number) {
    if (step < this.currentStep()) {
       this.currentStep.set(step);
    }
  }
}
