import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistStateService } from '../../core/services/wishlist/wishlist-state.service';
import { ProductCardComponent } from '../product/product-card/product-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, LucideAngularModule, RouterModule, TranslateModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent {
  wishlistState = inject(WishlistStateService);
}
