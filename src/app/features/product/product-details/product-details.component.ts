import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Meta } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language/language.service';
import { ProductsService } from '../../../core/services/products/products.service';
import { Product } from '../../../shared/models/product.model';
import { BasketStateService } from '../../../core/services/cart/basket-state.service';
import { WishlistStateService } from '../../../core/services/wishlist/wishlist-state.service';
import { BasketItem } from '../../../shared/models/basket';
import { RatingsComponent } from './ratings/ratings.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RatingsComponent, TranslateModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  public languageService = inject(LanguageService);

  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  selectedImage = signal<string | null>(null);
  quantity = signal<number>(1);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.error.set(this.translate.instant('product.details.errorNotFound'));
      this.loading.set(false);
    }
  }

  loadProduct(id: string) {
    this.loading.set(true);
    this.productsService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        if (product.photos && product.photos.length > 0) {
          this.selectedImage.set(product.photos[0].imageName);
        }
        
        // SEO: Update Meta Tags
        this.meta.updateTag({ name: 'description', content: product.description });
        
        // OpenGraph Tags
        this.meta.updateTag({ property: 'og:title', content: product.name });
        this.meta.updateTag({ property: 'og:description', content: product.description });
        this.meta.updateTag({ property: 'og:type', content: 'product' });
        this.meta.updateTag({ property: 'og:url', content: `https://e-store-x.web.app/product/${product.id}` }); // Adjust base URL if needed
        if (product.photos && product.photos.length > 0) {
           this.meta.updateTag({ property: 'og:image', content: `https://estorex.runasp.net/${product.photos[0].imageName}` });
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(this.translate.instant('product.details.errorFailedToLoad'));
        this.loading.set(false);
      }
    });
  }

  setImage(image: string) {
    this.selectedImage.set(image);
  }

  incrementQuantity() {
    this.quantity.update(q => {
      const product = this.product();
      if (product && q < product.quantityAvailable) {
        return q + 1;
      }
      return q;
    });
  }

  decrementQuantity() {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  private basketState = inject(BasketStateService);
  private wishlistState = inject(WishlistStateService);

  isInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistState.isInWishlist(p.id) : false;
  });

  addToCart() {
    const product = this.product();
    if (!product) return;
    
    const item: BasketItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      quantity: this.quantity(),
      price: product.newPrice,
      category: product.categoryName,
      image: 'https://estorex.runasp.net/' + (product.photos[0]?.imageName || '')
    };

    this.basketState.addItem(item);
  }

  addToWishlist() {
    const product = this.product();
    if (!product) return;
    this.wishlistState.toggleWishlist(product);
  }

  getImageUrl(path: string | undefined): string {
    if (!path) return '';
    const cleanPath = path.replace(/\\/g, '/');
    return `https://estorex.runasp.net/${cleanPath}`;
  }
}
