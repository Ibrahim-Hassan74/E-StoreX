import { Component, input, signal } from '@angular/core';
import { DeliveryItem } from '../../../shared/models/delivery-item';
import { DeliveryCardComponent } from './delivery-card/delivery-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [DeliveryCardComponent, TranslateModule],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss',
})
export class DeliveryComponent {
  deliveryItems = signal<DeliveryItem[]>([
    {
      iconName: 'percent',
      title: 'home.delivery.discount.title',
      description: 'home.delivery.discount.desc',
    },
    {
      iconName: 'truck',
      title: 'home.delivery.free_delivery.title',
      description: 'home.delivery.free_delivery.desc',
    },
    {
      iconName: 'clock-3',
      title: 'home.delivery.support.title',
      description: 'home.delivery.support.desc',
    },
    {
      iconName: 'shield-check',
      title: 'home.delivery.secure_payment.title',
      description: 'home.delivery.secure_payment.desc',
    },
  ]);
}
