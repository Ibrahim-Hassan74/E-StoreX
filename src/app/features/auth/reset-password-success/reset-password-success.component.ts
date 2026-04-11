import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password-success',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './reset-password-success.component.html',
})
export class ResetPasswordSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  callback = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const cb = params['callback'];
      if (cb) {
        this.callback.set(cb);
      }
    });
  }

  continueCallback(): void {
    const cb = this.callback();
    if (cb) {
      window.location.href = cb + '?status=success';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
