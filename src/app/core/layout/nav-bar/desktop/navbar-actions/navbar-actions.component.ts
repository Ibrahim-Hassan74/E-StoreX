import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NavbarService } from '../../navbar.service';
import { AccountService } from '../../../../services/account/account.service';
import { BasketStateService } from '../../../../services/cart/basket-state.service';
import { WishlistStateService } from '../../../../services/wishlist/wishlist-state.service';
import { computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-navbar-actions',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './navbar-actions.component.html',
  styleUrl: './navbar-actions.component.scss',
})
export class NavbarActionsComponent {
  isDropdownOpen = signal(false);
  private navbarService = inject(NavbarService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  isDarkMode = this.navbarService.mode;
  currentUser = this.accountService.currentUser;
  
  private basketState = inject(BasketStateService);
  basketCount = this.basketState.basketCount;
  
  private wishlistState = inject(WishlistStateService);
  wishlistCount = computed(() => this.wishlistState.wishlist().length);

  ngOnInit() {
    this.navbarService.load();
  }

  toggleTheme() {
    this.navbarService.toggleTheme();
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update((d) => !d);
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }

  logout() {
    this.accountService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
    this.closeDropdown();
  }
}
