import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './confirm-email.component.html',
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private uiFeedback = inject(UiFeedbackService);
  private router = inject(Router);

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
        this.errorMessage.set('Invalid verification link.');
        this.uiFeedback.error('Invalid verification link.');
      }
    });
  }

  confirm(userId: string, token: string) {
    this.accountService.confirmEmail({ userId, token }).subscribe({
      next: async (res: any) => {
        console.log(res);
        this.isLoading.set(false);
        if (res.success) {
          const msg = res.message || 'Email confirmed successfully.';
          this.successMessage.set(msg);
          await this.uiFeedback.success(msg, 'Success');
        } else {
          const msg = res.message || 'Failed to verify email.';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const msg = err.error?.errors?.join(', ') || 'Failed to verify email.';
        this.errorMessage.set(msg);
        this.uiFeedback.error(msg);
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
