import { Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, tap, map, of, catchError, throwError, firstValueFrom } from 'rxjs';
import { ResourceService } from '../resource.service';
import { ConfigService } from '../configurations/config.service';
import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  RefreshTokenRequest,
  User,
  UpdateProfileRequest,
  Address,
  ChangePasswordRequest,
  ConfirmEmailRequest
} from '../../../shared/models/auth';

@Injectable({
  providedIn: 'root'
})
export class AccountService extends ResourceService<User> {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  
  private currentUserSignal = signal<User | null>(null);
  public currentUser = computed(() => this.currentUserSignal());

  private configService = inject(ConfigService);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    super('Account');
  }

  public initializeUser(): Promise<void | User | null> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();

    const token = this.getToken();
    if (token && this.isValidTokenFormat(token)) {
      return firstValueFrom(
        this.getMe().pipe(
          tap((user) => this.currentUserSignal.set(user)),
          catchError(() => {
            this.clearSession();
            return of(null);
          })
        )
      );
    }
    
    this.clearSession();
    return Promise.resolve();
  }

  private isValidTokenFormat(token: string): boolean {
    return token.split('.').length === 3;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('register'), data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('login'), data).pipe(
      tap((response) => {
        if (response.success && response.token && response.refreshToken) {
          this.setSession(response);
          this.getMe().subscribe(user => this.currentUserSignal.set(user));
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(this.buildUrl('logout'), {}).pipe(
      catchError(() => of(void 0)),
      tap(() => {
        this.clearSession();
      })
    );
  }

  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('forgot-password'), { email });
  }

  resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('reset-password'), data);
  }

  verifyResetToken(userId: string, token: string): Observable<AuthResponse> {
    const params = { userId, token };
    return this.http.get<AuthResponse>(this.buildUrl('reset-password/verify'), { params: params as any });
  }

  resendConfirmationEmail(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.buildUrl('resend-confirmation-email'), { email });
  }

  refreshToken(data: RefreshTokenRequest): Observable<AuthResponse> {
    if (!this.isValidTokenFormat(data.token)) {
      return throwError(() => new Error(this.translate.instant('services.account.invalidToken')));
    }

    return this.http.post<AuthResponse>(this.buildUrl('generate-new-jwt-token'), data).pipe(
      tap((response) => {
        if (response.success && response.token) {
           if (isPlatformBrowser(this.platformId)) {
            // console.log(response);
             localStorage.setItem(this.TOKEN_KEY, response.token);
             if (response.refreshToken) {
               localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
             }
           }
        }
      })
    );
  }

  getMe(): Observable<User> {
    return this.get<User>('me');
  }

  updateProfile(data: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(this.buildUrl('update-profile'), data).pipe(
      tap(() => {
        this.getMe().subscribe(user => this.currentUserSignal.set(user));
      })
    );
  }

  uploadPhoto(file: File, cropOptions?: { cropX: number; cropY: number; cropWidth: number; cropHeight: number; zoom: number }): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (cropOptions) {
      formData.append('cropX', cropOptions.cropX.toString());
      formData.append('cropY', cropOptions.cropY.toString());
      formData.append('cropWidth', cropOptions.cropWidth.toString());
      formData.append('cropHeight', cropOptions.cropHeight.toString());
      formData.append('zoom', cropOptions.zoom.toString());
    }

    return this.http.patch<AuthResponse>(this.buildUrl('upload-photo'), formData).pipe(
      tap(() => this.getMe().subscribe(user => this.currentUserSignal.set(user)))
    );
  }

  deletePhoto(): Observable<AuthResponse> {
    return this.http.delete<AuthResponse>(this.buildUrl('delete-photo')).pipe(
      tap(() => this.getMe().subscribe(user => this.currentUserSignal.set(user)))
    );
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<AuthResponse> {
    const params = { userId: data.userId, token: data.token };
    return this.http.get<AuthResponse>(this.buildUrl('confirm-email'), { params: params as any });
  }

  changePassword(data: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(this.buildUrl('update-profile'), data);
  }

  getAddress(): Observable<Address> {
    return this.get<Address>('get-address');
  }

  updateAddress(data: Address): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(this.buildUrl('update-address'), data);
  }

  deleteAccount(): Observable<AuthResponse> {
    return this.http.delete<AuthResponse>(this.buildUrl('delete')).pipe(
      tap(() => this.logout())
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.getMe().pipe(
      tap(user => this.currentUserSignal.set(user))
    );
  }

  public setSession(authResult: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      if (authResult.token) localStorage.setItem(this.TOKEN_KEY, authResult.token);
      if (authResult.refreshToken) localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refreshToken);
    }
  }

  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  loginWithGoogle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const clientId = this.configService.clientId;
    if (!clientId) {
      console.error(this.translate.instant('services.account.clientIdMissing'));
      return;
    }
    const redirectUrl = this.buildUrl(`external-login?provider=Google&clientId=${clientId}`);
    window.location.href = redirectUrl;
  }

  loginWithGitHub(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const clientId = this.configService.clientId;
    if (!clientId) {
      console.error(this.translate.instant('services.account.clientIdMissing'));
      return;
    }
    const redirectUrl = this.buildUrl(`external-login?provider=GitHub&clientId=${clientId}`);
    window.location.href = redirectUrl;
  }
}
