import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private uiFeedback = inject(UiFeedbackService);

  form = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])/)]],
      confirmPassword: ['', Validators.required],
      token: ['', Validators.required],
      userId: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  isLoading = signal(false);
  isVerifying = signal(true);
  tokenStatus = signal<'pending' | 'valid' | 'invalid'>('pending');
  errorMessage = signal<string | null>(null);
  
  callback = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const userId = params['userId'];
      const callback = params['callback'];
      
      if (callback) {
        this.callback.set(callback);
      }

      if (!token || !userId) {
        this.tokenStatus.set('invalid');
        this.errorMessage.set('Invalid or missing reset token.');
        this.isVerifying.set(false);
        this.uiFeedback.error('Invalid or missing reset token.');
        return;
      }

      this.form.patchValue({
        token: token,
        userId: userId,
      });

      this.verifyToken(userId, token);
    });
  }

  verifyToken(userId: string, token: string): void {
    this.accountService.verifyResetToken(userId, token).subscribe({
      next: (res) => {
        this.isVerifying.set(false);
        if (res.success && res.statusCode === 200) {
          this.tokenStatus.set('valid');
        } else {
          this.tokenStatus.set('invalid');
          const msg = res.message || 'Invalid or expired token.';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      },
      error: (err) => {
        this.isVerifying.set(false);
        this.tokenStatus.set('invalid');
        const msg = err.error?.errors?.join(', ') || 'Failed to verify token.';
        this.errorMessage.set(msg);
        this.uiFeedback.error(msg);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.form.get(controlName);
    return !!(
      control &&
      control.hasError(error) &&
      control.dirty
    );
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.accountService.resetPassword(this.form.value as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success) {
          const queryParams: any = {};
          if (this.callback()) {
            queryParams['callback'] = this.callback();
          }
          this.router.navigate(['/auth/reset-password-success'], { queryParams });
        } else {
          const msg = res.errors?.join(', ') || res.message || 'Failed to reset password.';
          this.uiFeedback.error(msg);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Failed to reset password.';
        this.uiFeedback.error(msg);
      }
    });
  }
}
