import { AccountService } from './core/services/account/account.service';
import { provideRouter, withInMemoryScrolling, TitleStrategy } from '@angular/router';
import { routes } from './app.routes';
import { PageTitleStrategy } from './core/strategies/page-title.strategy';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { lucideIconsConfig } from './core/configs/lucide-icons.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { languageInterceptor } from './core/interceptors/language.interceptor';
import { transferStateInterceptor } from './core/interceptors/transfer-state.interceptor';

import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { LanguageService } from './core/services/language/language.service';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';



function initializeApp(accountService: AccountService, languageService: LanguageService) {
  return () => {
    languageService.initLanguage();
    return accountService.initializeUser();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([apiKeyInterceptor, authInterceptor, languageInterceptor, transferStateInterceptor])),

    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [AccountService, LanguageService],
    },
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategy,
    },
    importProvidersFrom(lucideIconsConfig),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: () => {
          const http = inject(HttpClient);
          const platformId = inject(PLATFORM_ID);
          return {
            getTranslation: (lang: string) => {
              if (isPlatformBrowser(platformId)) {
                return http.get(`/assets/i18n/${lang}.json`);
              }
              return of({});
            }
          };
        }
      }
    }),
  ],
};
