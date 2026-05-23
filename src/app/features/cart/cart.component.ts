import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BasketStateService } from '../../core/services/cart/basket-state.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartOrderSummaryComponent } from './cart-order-summary/cart-order-summary.component';
import { BasketItem } from '../../shared/models/basket';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslateModule, CartItemComponent, CartOrderSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  basketState = inject(BasketStateService);
  private translate = inject(TranslateService);

  get basket() {
    return this.basketState.basket();
  }

  get basketItems() {
    return this.basketState.basketItems();
  }

  get basketTotal() {
    return this.basketState.basketTotal();
  }
  
  get discountInfo() {
      return {
          value: this.basket?.discountValue || 0,
          percentage: this.basket?.percentage || 0
      };
  }

  get subtotal() {
      return this.basketState.basketSubTotal();
  }

  private ui = inject(UiFeedbackService);

  increaseItem(item: BasketItem) {
    this.basketState.increaseItem(item.id);
  }

  async decreaseItem(item: BasketItem) {
    if (item.quantity > 1) {
      const confirmed = await this.ui.confirm(
        this.translate.instant('cart.dialogs.decreaseConfirm'),
        this.translate.instant('cart.dialogs.confirmAction'),
        this.translate.instant('cart.dialogs.decreaseBtn'),
        this.translate.instant('cart.dialogs.cancelBtn'),
        'warning'
      );
      if (confirmed) {
        this.basketState.decreaseItem(item.id);
      }
    } 
    else {
      const confirmed = await this.ui.confirm(
        this.translate.instant('cart.dialogs.lastItemWarning'),
        this.translate.instant('cart.dialogs.removeConfirmTitle'),
        this.translate.instant('cart.dialogs.removeConfirmBtn'),
        this.translate.instant('cart.dialogs.cancelBtn'),
        'warning'
      );
      if (confirmed) {
        this.basketState.decreaseItem(item.id);
      }
    }
  }

  async removeItem(item: BasketItem) {
    const confirmed = await this.ui.confirm(
      this.translate.instant('cart.dialogs.removeConfirmText'),
      this.translate.instant('cart.dialogs.removeItem'),
      this.translate.instant('cart.dialogs.yesRemove'),
      this.translate.instant('cart.dialogs.cancelBtn'),
      'warning'
    );
    if (confirmed) {
      this.basketState.removeItem(item.id);
    }
  }

  applyDiscount(code: string) {
    this.basketState.applyDiscount(code).subscribe();
  }
}
