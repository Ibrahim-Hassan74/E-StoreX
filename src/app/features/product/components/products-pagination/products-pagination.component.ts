import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStateService } from '../../product.state';
import { LanguageService } from '../../../../core/services/language/language.service';

@Component({
  selector: 'app-products-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './products-pagination.component.html'
})
export class ProductsPaginationComponent {
  state = inject(ProductStateService);
  public languageService = inject(LanguageService);

  get totalPages(): number {
    const total = this.state.pagination()?.totalCount || 0;
    const size = this.state.query().pageSize || 12;
    return Math.ceil(total / size);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.state.updateQuery({ pageNumber: page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
