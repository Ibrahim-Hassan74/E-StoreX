
import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Address } from '../../../shared/models/auth';
import { DeliveryMethod, OrderToCreate } from '../../../shared/models/order';
import { AccountService } from '../account/account.service';
import { BasketStateService } from '../cart/basket-state.service';
import { OrdersService } from '../orders/orders.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private accountService = inject(AccountService);
  private basketState = inject(BasketStateService);
  private ordersService = inject(OrdersService);
  private translate = inject(TranslateService);

  private _shippingAddress = signal<Address | null>(null);
  private _deliveryMethod = signal<DeliveryMethod | null>(null);
  shippingAddress = computed(() => this._shippingAddress());
  deliveryMethod = computed(() => this._deliveryMethod());
  
  total = computed(() => {
    const subTotal = this.basketState.basketSubTotal();
    const shippingPrice = this._deliveryMethod()?.price ?? 0;
    const discount = this.basketState.basket()?.discountValue ?? 0;
    return subTotal + shippingPrice - discount;
  });

  constructor() { }

  updateShippingAddress(address: Address) {
    this._shippingAddress.set(address);
  }

  updateDeliveryMethod(method: DeliveryMethod) {
    this._deliveryMethod.set(method);
  }

  getDeliveryMethods() {
    return this.ordersService.getDeliveryMethods();
  }

  createOrder() {
    const basket = this.basketState.basket();
    const deliveryMethod = this._deliveryMethod();
    const address = this._shippingAddress();

    if (!basket || !deliveryMethod || !address) {
      throw new Error(this.translate.instant('services.checkout.missingData'));
    }

    const orderToCreate: OrderToCreate = {
      basketId: basket.id,
      deliveryMethodId: deliveryMethod.id,
      shippingAddress: address
    };

    return this.ordersService.createOrder(orderToCreate);
  }
}
