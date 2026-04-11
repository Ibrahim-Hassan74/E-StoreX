import { Component, computed, input, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brand } from '../../../shared/models/brand';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-brands',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home-brands.component.html',
  styleUrl: './home-brands.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeBrandsComponent {
  brands = input.required<Brand[]>();
  languageService = inject(LanguageService);
  shouldLoop = computed(() => this.brands().length > 6);
}
