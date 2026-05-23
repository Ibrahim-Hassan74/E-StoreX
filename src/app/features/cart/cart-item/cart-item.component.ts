import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BasketItem } from '../../../shared/models/basket';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, TranslateModule],
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {
  @Input({ required: true }) item!: BasketItem;
  @Output() increase = new EventEmitter<void>();
  @Output() decrease = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onIncrease() {
    this.increase.emit();
  }

  onDecrease() {
    this.decrease.emit();
  }

  onRemove() {
    this.remove.emit();
  }
}
