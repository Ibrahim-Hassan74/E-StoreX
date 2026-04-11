import { Component, CUSTOM_ELEMENTS_SCHEMA, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slide } from '../../../shared/models/slide';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home-banner.component.html',
  styleUrl: './home-banner.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeBannerComponent {
  slides = input.required<Slide[]>();
  languageService = inject(LanguageService);
  shouldLoopSlides = computed(() => this.slides().length > 1);
}
