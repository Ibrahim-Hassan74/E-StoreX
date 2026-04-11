import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WishlistService } from './wishlist.service';
import { UiFeedbackService } from '../ui-feedback.service';
import { Product } from '../../../shared/models/product.model';
import { AccountService } from '../../services/account/account.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistStateService {
  private wishlistService = inject(WishlistService);
  private ui = inject(UiFeedbackService);
  private accountService = inject(AccountService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  private wishlistSignal = signal<Product[]>([]);

  wishlist = computed(() => this.wishlistSignal());
  wishlistIds = computed(() => new Set(this.wishlistSignal().map(p => p.id)));
  isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.accountService.currentUser();
      if (user) {
        this.loadWishlist();
      } else {
        this.wishlistSignal.set([]);
      }
    });
  }

  loadWishlist() {
    this.isLoading.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: (products) => {
        this.wishlistSignal.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(this.translate.instant('services.wishlist.failedLoad'), err);
        this.isLoading.set(false);
      }
    });
  }

  toggleWishlist(product: Product) {
    if (!this.accountService.currentUser()) {
      this.ui.confirm(
        this.translate.instant('services.wishlist.loginToAdd'),
        this.translate.instant('services.wishlist.loginRequired'),
        'Login',
        this.translate.instant('services.uiFeedback.cancel'),
        'info'
      ).then((confirmed) => {
        if (confirmed) {
          this.router.navigate(['/auth/login']);
        }
      });
      return;
    }

    const isInWishlist = this.wishlistIds().has(product.id);

    if (isInWishlist) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => {
          this.wishlistSignal.update(list => list.filter(p => p.id !== product.id));
          this.ui.success(this.translate.instant('services.wishlist.itemRemoved'), this.translate.instant('services.wishlist.removed'));
        },
        error: (err) => this.ui.error(err.error?.message || this.translate.instant('services.wishlist.failedRemove'))
      });
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.wishlistSignal.update(list => [...list, product]);
          this.ui.success(this.translate.instant('services.wishlist.itemAdded'), this.translate.instant('services.wishlist.added'));
        },
        error: (err) => this.ui.error(err.error?.message || this.translate.instant('services.wishlist.failedAdd'))
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }
}
