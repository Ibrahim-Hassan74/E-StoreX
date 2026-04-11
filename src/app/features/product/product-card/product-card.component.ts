import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
  PLATFORM_ID,
  computed,
} from '@angular/core';
import { isPlatformBrowser, CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { Product } from '../../../shared/models/product.model';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule, RouterLink } from '@angular/router';
import { BasketStateService } from '../../../core/services/cart/basket-state.service';
import { WishlistStateService } from '../../../core/services/wishlist/wishlist-state.service';
import { BasketItem } from '../../../shared/models/basket';
import { LanguageService } from '../../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterModule,
    RouterLink,
    NgClass,
    CurrencyPipe,
    TranslateModule,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductCardComponent {
  product = input.required<Product>();

  @ViewChild('swiperEl', { static: true }) swiperEl!: ElementRef;

  private basketState = inject(BasketStateService);
  private wishlistState = inject(WishlistStateService);
  languageService = inject(LanguageService);

  isInWishlist = computed(() => this.wishlistState.isInWishlist(this.product().id));
  shouldLoop = computed(() => this.product().photos.length > 1);

  private platformId = inject(PLATFORM_ID);

  addToCart(event: Event) {
    const product = this.product();
    const item: BasketItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: 1,
      price: product.newPrice,
      category: product.categoryName,
      image: 'https://estorex.runasp.net/' + (product.photos[0]?.imageName || '')
    };
    
    this.basketState.addItem(item);
  }

  toggleWishlist(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistState.toggleWishlist(this.product());
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const swiper = this.swiperEl.nativeElement;
      Object.assign(swiper, {
        rtl: this.languageService.isRTL()
      });
      swiper.initialize();
    }
  }
}
