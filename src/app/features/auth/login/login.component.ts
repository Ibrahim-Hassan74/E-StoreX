import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { BasketStateService } from '../../../core/services/cart/basket-state.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private basketState = inject(BasketStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private uiFeedback = inject(UiFeedbackService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      if (token && refreshToken) {
         this.accountService.setSession({ 
            token, 
            refreshToken, 
            success: true, 
            message: 'External login successful', 
            statusCode: 200 
         });
         this.accountService.loadCurrentUser().subscribe(async () => {
            this.basketState.handleLoginBasketSync();
            await this.uiFeedback.success('You have signed in successfully.', 'Welcome back!');
            this.router.navigateByUrl(this.returnUrl);
         });
      }
    });
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showResendConfirmation = signal(false);
  resendSuccessMessage = signal<string | null>(null);

  returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

  hasError(controlName: string, error: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(
      control &&
      control.hasError(error) &&
      control.dirty
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.resendSuccessMessage.set(null);

    this.accountService.login(this.loginForm.value as any).subscribe({
      next: async (res: any) => {
        this.isLoading.set(false);
        if (res.success) {
          await this.uiFeedback.success('You have signed in successfully.', 'Welcome back!');
          this.basketState.handleLoginBasketSync();
          this.router.navigateByUrl(this.returnUrl);
        } else {
           this.handleLoginError(res.message);
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err.error?.errors?.join(', ') || 'Invalid email or password';
        this.handleLoginError(message);
      }
    });
  }

  private handleLoginError(message: string): void {
    this.uiFeedback.error(message);

    if (
      message.toLowerCase().includes('confirm') &&
      message.toLowerCase().includes('email') &&
      !message.toLowerCase().includes('wait')
    ) {
        this.uiFeedback.confirm(message + " Would you like to resend the confirmation email?", "Email not confirmed", "Yes, resend", "No").then(confirmed => {
            if (confirmed) {
                this.onResendConfirmation();
            }
        });
    }
  }

  onResendConfirmation(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) return;

    this.isLoading.set(true);

    this.accountService.resendConfirmationEmail(email).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.success) {
          this.uiFeedback.success(res.message || 'Confirmation email sent!', 'Success');
        } else {
          this.uiFeedback.error(res.message || 'Failed to resend email.');
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'Failed to resend email.';
        this.uiFeedback.error(message);
      }
    });
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    this.accountService.loginWithGoogle();
  }

  loginWithGitHub() {
    this.isLoading.set(true);
    this.accountService.loginWithGitHub();
  }
}
