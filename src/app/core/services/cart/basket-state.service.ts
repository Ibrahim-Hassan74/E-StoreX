import { computed, inject, Injectable, signal, effect, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Basket, BasketItem } from '../../../shared/models/basket';
import { BasketService } from './basket.service';
import { of, tap } from 'rxjs';
import { AccountService } from '../../services/account/account.service';
import { UiFeedbackService } from '../ui-feedback.service';

@Injectable({
  providedIn: 'root',
})
export class BasketStateService {
  private basketService = inject(BasketService);
  private accountService = inject(AccountService);
  private ui = inject(UiFeedbackService);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  private basketSignal = signal<Basket | null>(null);

  basket = computed(() => this.basketSignal());
  basketItems = computed(() => this.basketSignal()?.basketItems ?? []);
  basketCount = computed(() =>
    this.basketItems().reduce((acc, item) => acc + item.quantity, 0)
  );
  
  basketSubTotal = computed(() => 
    this.basketItems().reduce((acc, item) => acc + (item.price * item.quantity), 0)
  );

  basketTotal = computed(() => {
    const sub = this.basketSubTotal();
    const discount = this.basketSignal()?.discountValue ?? 0;
    return sub - discount;
  });

  private loginBasketSyncInProgress = false;

  constructor() {
    effect(() => {
      const user = this.accountService.currentUser();
      if (user) {
        if (!this.loginBasketSyncInProgress) {
           this.handleAuthUser(user.id!);
        }
      } else {
        this.handleGuestUser();
      }
    });
  }

  private get guestBasketId(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('guestBasketId');
    }
    return null;
  }

  private set guestBasketId(id: string | null) {
    if (isPlatformBrowser(this.platformId)) {
      if (id) {
        localStorage.setItem('guestBasketId', id);
      } else {
        localStorage.removeItem('guestBasketId');
      }
    }
  }

  private get currentBasketId(): string | null {
    const user = this.accountService.currentUser();
    if (user?.id) {
      return user.id;
    }
    return this.guestBasketId;
  }

  private handleAuthUser(userId: string) {
      this.loadUserBasket(userId);
  }

  public handleLoginBasketSync() {
      if (this.loginBasketSyncInProgress) return;
      this.loginBasketSyncInProgress = true;

      const user = this.accountService.currentUser();
      if (!user) {
          this.loginBasketSyncInProgress = false;
          return;
      }

      const guestId = this.guestBasketId;

      if (guestId) {
          this.basketService.mergeBasket(guestId).subscribe({
              next: (basket) => {
                  this.basketSignal.set(basket);
                  this.guestBasketId = null;
                  this.loginBasketSyncInProgress = false;
              },
              error: (err) => {
                  console.error(this.translate.instant('services.basket.mergeFailed'), err);
                  this.guestBasketId = null;
                  this.loadUserBasket(user.id!);
                  this.loginBasketSyncInProgress = false;
              }
          });
      } else {
          this.loadUserBasket(user.id!);
          this.loginBasketSyncInProgress = false;
      }
  }

  private loadUserBasket(userId: string) {
    this.basketService.getBasket(userId).subscribe({
      next: (basket) => {
        this.basketSignal.set(basket);
      },
      error: () => {
        this.basketSignal.set(null);
      }
    });
  }

  private handleGuestUser() {
    this.basketSignal.set(null);
    this.loginBasketSyncInProgress = false;

    const guestId = this.guestBasketId;
    if (guestId) {
        this.basketService.getBasket(guestId).subscribe({
            next: (basket) => this.basketSignal.set(basket),
            error: () => {
                this.guestBasketId = null;
                this.basketSignal.set(null);
            }
        });
    }
  }

  addItem(item: BasketItem) {
    let basketId = this.currentBasketId;
    if (!basketId) {
        basketId = this.createUUID();
        this.guestBasketId = basketId;
    }

    this.basketService.addBasket(item, basketId).subscribe({
      next: (basket) => {
        this.basketSignal.set(basket);
        this.ui.success(this.translate.instant('services.basket.itemAdded'), this.translate.instant('services.basket.addedToCart'));
      },
      error: (err) => {
        console.error('AddItem Error:', err);
        this.ui.error(err.error?.message || this.translate.instant('services.basket.failedAdd'));
      }
    });
  }

  removeItem(itemId: string) {
    const id = this.currentBasketId;
    if (!id) return;
    
    this.basketService.removeItem(id, itemId).subscribe({
      next: b => this.basketSignal.set(b),
      error: err => this.ui.error(err.error?.message || this.translate.instant('services.basket.failedRemove'))
    });
  }
  
  increaseItem(itemId: string) {
    const id = this.currentBasketId;
    if (!id) return;

    this.basketService.increaseItem(id, itemId).subscribe({
      next: b => {
          this.basketSignal.set(b);
      },
      error: err => this.ui.error(err.error?.message || this.translate.instant('services.basket.failedIncrease'))
    });
  }
  
  decreaseItem(itemId: string) {
    const id = this.currentBasketId;
    if (!id) return;

    this.basketService.decreaseItem(id, itemId).subscribe({
      next: b => this.basketSignal.set(b),
      error: err => this.ui.error(err.error?.message || this.translate.instant('services.basket.failedDecrease'))
    });
  }

  applyDiscount(code: string): import('rxjs').Observable<Basket | null> {
    const id = this.currentBasketId;
    if (!id) return of(null);
    
    return this.basketService.applyDiscount(id, code).pipe(
      tap({
        next: b => this.basketSignal.set(b),
        error: err => this.ui.error(err.error?.message || this.translate.instant('services.basket.failedApplyDiscount'))
      })
    );
  }

  clearBasket() {
    this.basketSignal.set(null);
    this.guestBasketId = null;
  }

  private createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
