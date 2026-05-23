import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language/language.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
      <button 
        (click)="switchLang('en')"
        [class]="currentLang === 'en' ? 'bg-[#029fae] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        class="flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer"
      >
        EN
      </button>
      <button 
        (click)="switchLang('ar')"
        [class]="currentLang === 'ar' ? 'bg-[#029fae] text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        class="flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer"
      >
        AR
      </button>
    </div>
  `
})
export class LanguageSwitcherComponent {
  private languageService = inject(LanguageService);

  get currentLang(): string {
    return this.languageService.getLanguage();
  }

  switchLang(lang: string): void {
    if (this.currentLang !== lang) {
      this.languageService.changeLanguage(lang);
    }
  }
}
