import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language/language.service';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  let lang = 'en';
  if (typeof localStorage !== 'undefined') {
    lang = localStorage.getItem('app_lang') || 'en';
  }

  if (req.url.includes('/assets/i18n/')) {
    return next(req);
  }

  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': lang
    }
  });

  return next(clonedRequest);
};
