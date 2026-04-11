import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ProductStateService } from '../../product.state';

@Component({
  selector: 'app-products-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './products-filters.component.html'
})
export class ProductsFiltersComponent {
  state = inject(ProductStateService);

  onSearchChange(value: string) {
    this.state.setSearch(value);
  }

  onCategoryChange(id: string) {
    this.state.updateQuery({ categoryId: id, pageNumber: 1 });
  }

  onBrandChange(id: string) {
    this.state.updateQuery({ brandId: id, pageNumber: 1 });
  }

  onMinPriceChange(val: number) {
      this.state.updateQuery({ minPrice: val, pageNumber: 1 });
  }

  onMaxPriceChange(val: number) {
      this.state.updateQuery({ maxPrice: val, pageNumber: 1 });
  }
}
