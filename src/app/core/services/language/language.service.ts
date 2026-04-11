import { Injectable, inject, Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private renderer: Renderer2;
  private readonly LANGUAGE_KEY = 'app_lang';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initLanguage(): void {
    this.translateService.addLangs(['en', 'ar']);
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = this.getStoredLanguage();
      this.translateService.setDefaultLang('en');
      this.setLanguage(savedLang);
    }
  }

  setLanguage(lang: string): void {
    this.translateService.use(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LANGUAGE_KEY, lang);
    }
    this.updateDocumentDirection(lang);
  }

  getLanguage(): string {
    return this.translateService.currentLang || this.getStoredLanguage();
  }

  getStoredLanguage(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.LANGUAGE_KEY) || 'en';
    }
    return 'en';
  }

  isRTL(): boolean {
    return this.getLanguage() === 'ar';
  }

  toggleLanguage(): void {
    const newLang = this.getLanguage() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  private updateDocumentDirection(lang: string): void {
    if (typeof document !== 'undefined') {
      const htmlTag = document.documentElement;
      this.renderer.setAttribute(htmlTag, 'lang', lang);
      this.renderer.setAttribute(htmlTag, 'dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
  }
}
