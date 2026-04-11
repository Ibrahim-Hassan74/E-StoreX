import { Component, inject, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NavbarService } from '../../navbar.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccountService } from '../../../../services/account/account.service';
import { BasketStateService } from '../../../../services/cart/basket-state.service';
import { WishlistStateService } from '../../../../services/wishlist/wishlist-state.service';
import { LanguageService } from '../../../../services/language/language.service';

@Component({
  selector: 'app-mobile-actions',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, TranslateModule, CommonModule],
  templateUrl: './mobile-actions.component.html',
  styleUrl: './mobile-actions.component.scss',
})
export class MobileActionsComponent {
  private navbarService = inject(NavbarService);
  private accountService = inject(AccountService);
  private basketState = inject(BasketStateService);
  private wishlistState = inject(WishlistStateService);
  private router = inject(Router);
  public languageService = inject(LanguageService);
  
  closeMenu = output<void>();

  isDarkMode = this.navbarService.mode;
  currentUser = this.accountService.currentUser;
  basketCount = this.basketState.basketCount;
  wishlistCount = computed(() => this.wishlistState.wishlist().length);

  ngOnInit() {
    this.navbarService.load();
  }

  toggleTheme() {
    this.navbarService.toggleTheme();
  }

  toggleLanguage() {
    this.languageService.toggleLanguage();
    this.closeMenu.emit();
  }

  logout() {
    this.accountService.logout().subscribe(() => {
      this.router.navigate(['/']);
      this.closeMenu.emit();
    });
  }
}
