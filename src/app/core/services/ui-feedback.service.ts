import { Injectable, inject, effect } from '@angular/core';
import { NavbarService } from '../layout/nav-bar/navbar.service';
import { TranslateService } from '@ngx-translate/core';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UiFeedbackService {
  private navbarService = inject(NavbarService);
  private translate = inject(TranslateService);
  private isDark = false;

  constructor() {
    effect(() => {
      this.isDark = this.navbarService.mode();
    });
  }

  private get commonOptions() {
    return {
      background: this.isDark ? '#1f2937' : '#ffffff', 
      color: this.isDark ? '#f3f4f6' : '#1f2937',    
      confirmButtonColor: '#0d9488', 
    };
  }

  success(message: string, title?: string, options: any = {}): Promise<any> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.success');
    return Swal.fire({
      ...this.commonOptions,
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: localizedTitle,
      text: message,
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      ...options
    });
  }

  error(message: string, title?: string, options: any = {}): Promise<any> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.error');
    return Swal.fire({
      ...this.commonOptions,
      icon: 'error',
      title: localizedTitle,
      text: message,
      confirmButtonText: this.translate.instant('services.uiFeedback.yes'),
      ...options
    });
  }

  info(message: string, title?: string, options: any = {}): Promise<any> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.info');
    return Swal.fire({
      ...this.commonOptions,
      icon: 'info',
      title: localizedTitle,
      text: message,
      confirmButtonText: this.translate.instant('services.uiFeedback.yes'),
      ...options
    });
  }

  warning(message: string, title?: string, options: any = {}): Promise<any> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.warning');
    return Swal.fire({
      ...this.commonOptions,
      icon: 'warning',
      title: localizedTitle,
      text: message,
      confirmButtonText: this.translate.instant('services.uiFeedback.yes'),
      ...options
    });
  }

  successPopup(message: string, title?: string, options: any = {}): Promise<any> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.success');
    return Swal.fire({
      ...this.commonOptions,
      icon: 'success',
      title: localizedTitle,
      text: message,
      confirmButtonText: this.translate.instant('services.uiFeedback.yes'),
      ...options
    });
  }

  confirm(message: string, title?: string, confirmText?: string, cancelText?: string, icon: any = 'warning'): Promise<boolean> {
    const localizedTitle = title || this.translate.instant('services.uiFeedback.areYouSure');
    const localizedConfirmText = confirmText || this.translate.instant('services.uiFeedback.yes');
    const localizedCancelText = cancelText || this.translate.instant('services.uiFeedback.cancel');
    return Swal.fire({
      ...this.commonOptions,
      title: localizedTitle,
      text: message,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: icon === 'warning' ? '#f59e0b' : '#d33', // Orange for warning, Red for delete (default logic, can be overridden)
      cancelButtonColor: '#3085d6',
      confirmButtonText: localizedConfirmText,
      cancelButtonText: localizedCancelText
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
