import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DeliveryItem } from '../../../../shared/models/delivery-item';

@Component({
  selector: 'app-delivery-card',
  standalone: true,
  imports: [LucideAngularModule, TranslateModule],
  templateUrl: './delivery-card.component.html',
  styleUrl: './delivery-card.component.scss',
})
export class DeliveryCardComponent {
  item = input.required<DeliveryItem>();
}
