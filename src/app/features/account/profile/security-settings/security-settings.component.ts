import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccountService } from '../../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../../core/services/ui-feedback.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './security-settings.component.html'
})
export class SecuritySettingsComponent {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private ui = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  message = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  changePasswordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmNewPassword')?.value;

    if (!password || !confirm) return null;
    return password !== confirm ? { passwordMismatch: true } : null;
  }

  onChangePassword(): void {
    if (this.changePasswordForm.invalid) return;

    const user = this.accountService.currentUser();
    const userId = user?.id;

    const requestData = {
      ...this.changePasswordForm.value,
      userId: userId
    };

    this.handleRequest(
      this.accountService.changePassword(requestData as any),
      this.translate.instant('account.security.passwordSuccess'),
      () => {
        this.changePasswordForm.reset();
        this.ui.successPopup(this.translate.instant('account.security.passwordSuccessLogout')).then(() => {
          this.accountService.logout().subscribe(() => {
             location.reload(); 
          });
        });
      }
    );
  }

  deleteAccount(): void {
    this.ui.confirm(
      this.translate.instant('account.security.deleteConfirmText'),
      this.translate.instant('account.security.deleteConfirmTitle'),
      this.translate.instant('account.security.deleteConfirmBtn'),
      this.translate.instant('account.security.deleteCancelBtn'),
      'warning'
    )
      .then((confirmed) => {
        if (!confirmed) return;

        this.isLoading.set(true);
        this.message.set(null);
        this.errorMessage.set(null);

        this.accountService.deleteAccount().subscribe({
          next: () => {
             this.ui.successPopup(this.translate.instant('account.security.deleteSuccess')).then(() => {
                location.reload();
             });
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(
              err?.error?.message || this.translate.instant('account.security.deleteFailed')
            );
          },
        });
      });
  }

  private handleRequest(
    request$: any,
    successMessage: string,
    callback?: () => void
  ): void {
    this.isLoading.set(true);
    this.message.set(null);
    this.errorMessage.set(null);

    request$.subscribe({
      next: (res: any) => {
        this.isLoading.set(false);

        if (res?.success === false) {
          this.errorMessage.set(res.message || this.translate.instant('account.security.operationFailed'));
          return;
        }

        this.message.set(successMessage);
        callback?.();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || this.translate.instant('account.security.operationFailed')
        );
      },
    });
  }
}
