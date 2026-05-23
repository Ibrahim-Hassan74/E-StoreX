import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterLink, TranslateModule],
  templateUrl: './cart-order-summary.component.html',
  styleUrls: ['./cart-order-summary.component.scss']
})
export class CartOrderSummaryComponent {
  @Input() subtotal: number = 0;
  @Input() discount: number = 0;
  @Input() percentage: number = 0;
  @Input() total: number = 0;
  
  @Output() applyDiscount = new EventEmitter<string>();

  promoCode = signal('');
  isApplying = signal(false);
  error = signal<string | null>(null);

  applyCode() {
    if(!this.promoCode()) return;
    this.isApplying.set(true);
    this.error.set(null);
    this.applyDiscount.emit(this.promoCode());
    setTimeout(() => this.isApplying.set(false), 1000); 
  }
}
