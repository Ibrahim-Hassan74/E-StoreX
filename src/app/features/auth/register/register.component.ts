import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AccountService } from '../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    TranslateModule
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private uiFeedback = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group(
    {
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(
      control &&
      control.hasError(error) &&
      control.dirty
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.accountService.register(this.registerForm.value as any).subscribe({
      next: async (res: any) => {
        this.isLoading.set(false);
        console.log(res);
        if (res.success) {
          await this.uiFeedback.success(
            this.translate.instant('auth.register.check_email_confirm'), 
            this.translate.instant('auth.register.account_created')
          );
          this.router.navigate(['/auth/login']);
        } else {
          console.log(res.errors);
          const message = res.errors?.join(', ') || res.message;
          this.uiFeedback.error(message, this.translate.instant('services.uiFeedback.error'));
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err?.error?.errors?.join(', ') || this.translate.instant('auth.register.registration_failed');
        this.uiFeedback.error(message, this.translate.instant('services.uiFeedback.error'));
      }
    });
  }
}
