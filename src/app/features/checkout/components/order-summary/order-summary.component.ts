import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketStateService } from '../../../../core/services/cart/basket-state.service';
import { CheckoutService } from '../../../../core/services/checkout/checkout.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './order-summary.component.html'
})
export class OrderSummaryComponent {
  basketState = inject(BasketStateService);
  checkoutService = inject(CheckoutService);
}
