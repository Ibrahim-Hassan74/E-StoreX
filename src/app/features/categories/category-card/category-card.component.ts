import { Component, computed, input, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesBrands } from '../../../shared/models/categories-brands';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategoryCardComponent {
  cat = input.required<CategoriesBrands>();
  languageService = inject(LanguageService);
  shouldLoop = computed(() => (this.cat().brandResponse?.length || 0) > 4);
}
