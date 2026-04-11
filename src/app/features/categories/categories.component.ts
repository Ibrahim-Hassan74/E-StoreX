import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesBrands } from '../../shared/models/categories-brands';
import { CategoryCardComponent } from './category-card/category-card.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LanguageService } from '../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, CategoryCardComponent, TranslateModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CategoriesComponent {
  categoriesBrands = input.required<CategoriesBrands[]>();
  languageService = inject(LanguageService);
}
