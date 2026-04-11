import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AccountService } from '../../../core/services/account/account.service';
import { BasketStateService } from '../../../core/services/cart/basket-state.service';
import { AuthResponse } from '../../../shared/models/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  template: `
    <div class="flex min-h-[60vh] flex-col items-center justify-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20">
        <lucide-icon name="Loader2" class="animate-spin text-[#029fae]" [size]="32"></lucide-icon>
      </div>
      <h2 class="mt-6 text-xl font-semibold text-gray-900 dark:text-white">{{ 'auth.oauth.processing' | translate }}</h2>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ 'auth.oauth.setup_session' | translate }}</p>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private basketState = inject(BasketStateService);
  private translate = inject(TranslateService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    const token = params['token'];
    const refreshToken = params['refreshToken'];

    if (token && refreshToken) {
      const authResponse: AuthResponse = {
        success: true,
        message: this.translate.instant('auth.login.external_signin_success'),
        statusCode: 200,
        token,
        refreshToken
      };

      this.accountService.setSession(authResponse);
      this.accountService.loadCurrentUser().subscribe(() => {
        this.basketState.handleLoginBasketSync();
        this.router.navigate(['/']);
      });
    } else {
      console.error('Missing token or refresh token in OAuth callback');
      this.router.navigate(['/auth/login']);
    }
  }
}
