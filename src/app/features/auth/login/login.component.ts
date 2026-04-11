import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../core/services/account/account.service';
import { BasketStateService } from '../../../core/services/cart/basket-state.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, TranslateModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private basketState = inject(BasketStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private uiFeedback = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const refreshToken = params['refreshToken'];
      if (token && refreshToken) {
         this.accountService.setSession({ 
            token, 
            refreshToken, 
            success: true, 
            message: this.translate.instant('auth.login.external_signin_success'), 
            statusCode: 200 
         });
         this.accountService.loadCurrentUser().subscribe(async () => {
            this.basketState.handleLoginBasketSync();
            await this.uiFeedback.success(
              this.translate.instant('auth.login.signin_success'),
              this.translate.instant('auth.login.welcome_back')
            );
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
          await this.uiFeedback.success(
            this.translate.instant('auth.login.signin_success'), 
            this.translate.instant('auth.login.welcome_back')
          );
          this.basketState.handleLoginBasketSync();
          this.router.navigateByUrl(this.returnUrl);
        } else {
           this.handleLoginError(res.message);
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err.error?.errors?.join(', ') || this.translate.instant('auth.login.invalid_credentials');
        this.handleLoginError(message);
      }
    });
  }

  private handleLoginError(message: string): void {
    this.uiFeedback.error(message, this.translate.instant('services.uiFeedback.error'));

    if (
      message.toLowerCase().includes('confirm') &&
      message.toLowerCase().includes('email') &&
      !message.toLowerCase().includes('wait')
    ) {
        this.uiFeedback.confirm(
            message + " " + this.translate.instant('auth.login.confirm_email_prompt'),
            this.translate.instant('auth.login.email_not_confirmed'),
            this.translate.instant('auth.login.yes_resend'),
            this.translate.instant('auth.login.no')
        ).then(confirmed => {
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
          this.uiFeedback.success(
            res.message || this.translate.instant('auth.login.resend_sent'),
            this.translate.instant('services.uiFeedback.success')
          );
        } else {
          this.uiFeedback.error(
            res.message || this.translate.instant('auth.login.resend_failed'),
            this.translate.instant('services.uiFeedback.error')
          );
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err.error?.message || this.translate.instant('auth.login.resend_failed');
        this.uiFeedback.error(message, this.translate.instant('services.uiFeedback.error'));
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
