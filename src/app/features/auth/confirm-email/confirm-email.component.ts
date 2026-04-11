import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, TranslateModule],
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private uiFeedback = inject(UiFeedbackService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isLoading = signal(true);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  redirectTo = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const token = params['token'];
      const redirect = params['redirectTo'];
      
      if (redirect) {
        this.redirectTo.set(redirect);
      }

      if (userId && token) {
        this.confirm(userId, token);
      } else {
        this.isLoading.set(false);
        this.errorMessage.set(this.translate.instant('auth.confirm_email.failed_title'));
        this.uiFeedback.error(
          this.translate.instant('auth.confirm_email.failed_title'),
          this.translate.instant('services.uiFeedback.error')
        );
      }
    });
  }

  confirm(userId: string, token: string) {
    this.accountService.confirmEmail({ userId, token }).subscribe({
      next: async (res: any) => {
        this.isLoading.set(false);
        if (res.success) {
          const msg = res.message || this.translate.instant('auth.confirm_email.success_desc');
          this.successMessage.set(msg);
          await this.uiFeedback.success(
            msg, 
            this.translate.instant('services.uiFeedback.success')
          );
        } else {
          const msg = res.message || this.translate.instant('auth.confirm_email.failed_title');
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg, this.translate.instant('services.uiFeedback.error'));
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const msg = err.error?.errors?.join(', ') || this.translate.instant('auth.confirm_email.failed_title');
        this.errorMessage.set(msg);
        this.uiFeedback.error(msg, this.translate.instant('services.uiFeedback.error'));
      }
    });
  }

  goLogin() {
    this.router.navigate(['/auth/login']);
  }

  goExternal() {
    const url = this.redirectTo();
    if (url) {
        window.location.href = url;
    }
  }
}
