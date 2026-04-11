import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ProductCardComponent } from '../../product-card/product-card.component';
import { ProductStateService } from '../../product.state';

@Component({
  selector: 'app-products-grid',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProductCardComponent, TranslateModule],
  templateUrl: './products-grid.component.html'
})
export class ProductsGridComponent {
  state = inject(ProductStateService);
}
