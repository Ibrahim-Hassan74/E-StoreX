import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Rating } from '../../../../../shared/models/rating';

@Component({
  selector: 'app-rating-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './rating-list.component.html',
  styleUrl: './rating-list.component.scss'
})
export class RatingListComponent {
  ratings = input.required<Rating[]>();
}
