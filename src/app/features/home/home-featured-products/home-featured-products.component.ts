import { Component, computed, inject, input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../shared/models/product.model';
import { ProductCardComponent } from '../../product/product-card/product-card.component';
import { LanguageService } from '../../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-featured-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, TranslateModule],
  templateUrl: './home-featured-products.component.html',
  styleUrl: './home-featured-products.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeFeaturedProductsComponent {
  featuredProducts = input.required<Product[]>();
  languageService = inject(LanguageService);
  shouldLoop = computed(() => this.featuredProducts().length > 6);
}
