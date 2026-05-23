import { Component, ElementRef, OnInit, ViewChild, inject, signal, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { CheckoutService } from '../../../../core/services/checkout/checkout.service';
import { PaymentService } from '../../../../core/services/payment/payment.service';
import { UiFeedbackService } from '../../../../core/services/ui-feedback.service';
import { BasketStateService } from '../../../../core/services/cart/basket-state.service';
import { ConfigService } from '../../../../core/services/configurations/config.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './checkout-payment.component.html'
})
export class CheckoutPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('cardNumber') cardNumberElement?: ElementRef;
  @Output() back = new EventEmitter<void>();

  checkoutService = inject(CheckoutService);
  paymentService = inject(PaymentService);
  basketState = inject(BasketStateService);
  ui = inject(UiFeedbackService);
  router = inject(Router);
  configService = inject(ConfigService);
  translate = inject(TranslateService);

  stripe: Stripe | null = null;
  elements: StripeElements | undefined;
  cardNumber: StripeCardElement | undefined;
  
  cardHandler = this.onChange.bind(this);
  cardErrors = signal<string | null>(null);
  loading = signal(false);
  isStripeReady = false;

  constructor() {}

  async ngOnInit() {
    await this.initializeStripe();
  }

  ngOnDestroy() {
    if (this.cardNumber) {
      this.cardNumber.destroy();
    }
  }

  onChange(event: any) {
    if (event.error) {
        this.cardErrors.set(event.error.message);
    } else {
        this.cardErrors.set(null);
    }
  }

  async initializeStripe() {
    const key = this.configService.publishableKey;
    if (!key) {
        this.ui.error(this.translate.instant('checkout.payment.stripeKeyMissing'));
        return;
    }
    
    this.stripe = await loadStripe(key);
    
    if (!this.stripe) {
        this.ui.error(this.translate.instant('checkout.payment.stripeLoadFailed'));
        return;
    }

    this.elements = this.stripe.elements();
    
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.cardNumber = this.elements.create('card', { style });
    
    if (this.cardNumberElement) {
         this.cardNumber.mount(this.cardNumberElement.nativeElement);
         this.cardNumber.on('change', this.cardHandler);
         this.isStripeReady = true;
    }
  }

  async submitOrder() {
    this.loading.set(true);
    const basket = this.basketState.basket();
    
    if (!basket) {
        this.ui.error(this.translate.instant('checkout.payment.cartEmpty'));
        this.loading.set(false);
        return;
    }

    try {
        const createdOrder = await new Promise<any>((resolve, reject) => {
             this.checkoutService.createOrder().subscribe({
                 next: resolve,
                 error: reject
              });
        });

        const clientSecret = this.paymentService.clientSecret();
        if (!clientSecret || !this.stripe || !this.cardNumber) {
            throw new Error(this.translate.instant('checkout.payment.paymentIntentNotInit'));
        }

        const result = await this.stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: this.cardNumber,
                billing_details: {
                    name: this.checkoutService.shippingAddress()?.firstName + ' ' + this.checkoutService.shippingAddress()?.lastName
                }
            }
        });

        if (result.error) {
            this.ui.error(result.error.message || this.translate.instant('checkout.payment.paymentFailed'));
            this.loading.set(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                this.basketState.clearBasket();
                this.router.navigate(['/checkout/success']);
            } else {
                this.ui.error(this.translate.instant('checkout.payment.paymentVerificationFailed'));
                 this.loading.set(false);
            }
        }

    } catch (error: any) {
        console.error(error);
        this.ui.error(error.message || this.translate.instant('checkout.payment.paymentError'));
        this.loading.set(false);
    }
  }
}
