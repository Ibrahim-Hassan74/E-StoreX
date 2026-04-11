import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../core/services/account/account.service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private uiFeedback = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = signal(false);

  hasError(error: string): boolean {
    const control = this.form.get('email');
    return !!(
      control &&
      control.hasError(error) &&
      control.dirty
    );
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.accountService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          this.uiFeedback.success(
            res.message || this.translate.instant('auth.forgot_password.resend_sent'),
            this.translate.instant('services.uiFeedback.success')
          );
        } else {
          this.uiFeedback.error(
            res.message || this.translate.instant('auth.forgot_password.resend_failed'),
            this.translate.instant('services.uiFeedback.error')
          );
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.uiFeedback.error(
          err.error?.errors?.join(', ') || this.translate.instant('auth.forgot_password.resend_failed'),
          this.translate.instant('services.uiFeedback.error')
        );
      }
    });
  }
}
