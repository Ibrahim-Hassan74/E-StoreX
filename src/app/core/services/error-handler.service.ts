import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UiFeedbackService } from './ui-feedback.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private translate = inject(TranslateService);
  private ui = inject(UiFeedbackService);

  /**
   * Translates and handles an error, optionally showing a UI notification.
   * @param error The error object (HttpErrorResponse or standard Error)
   * @param defaultKey The default translation key if no specific error message is found
   */
  handleError(error: any, defaultKey: string = 'services.uiFeedback.error'): string {
    let message = '';

    if (error instanceof HttpErrorResponse) {
      if (error.error?.message) {
        message = this.translate.instant(error.error.message) !== error.error.message
          ? this.translate.instant(error.error.message)
          : error.error.message;
      } else {
        message = this.translate.instant(defaultKey);
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = this.translate.instant(error);
    } else {
      message = this.translate.instant(defaultKey);
    }

    console.error('Handled Error:', error);

    return message;
  }

  /**
   * Handles an error and shows an error popup/toast automatically
   */
  showError(error: any, titleKey: string = 'services.uiFeedback.error'): void {
    const message = this.handleError(error);
    const title = this.translate.instant(titleKey);
    this.ui.error(message, title);
  }
}
