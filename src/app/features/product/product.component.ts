import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, Params } from '@angular/router';

import { ProductStateService } from './product.state';
import { ProductsToolbarComponent } from './components/products-toolbar/products-toolbar.component';
import { ProductsGridComponent } from './components/products-grid/products-grid.component';
import { ProductsPaginationComponent } from './components/products-pagination/products-pagination.component';
import { ProductsFiltersComponent } from './components/products-filters/products-filters.component';
import { MobileFiltersDrawerComponent } from './components/mobile-filters-drawer/mobile-filters-drawer.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule, 
    LucideAngularModule,
    ProductsToolbarComponent,
    ProductsGridComponent,
    ProductsPaginationComponent,
    ProductsFiltersComponent,
    MobileFiltersDrawerComponent,
    TranslateModule
  ],
  providers: [ProductStateService],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  state = inject(ProductStateService);

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.state.initialize();
    this.route.queryParams.subscribe((params: Params) => {
      this.state.setQueryFromUrl(params);
    });
  }
}
