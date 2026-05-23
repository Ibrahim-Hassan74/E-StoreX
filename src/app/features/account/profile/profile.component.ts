import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../core/services/account/account.service';
import { ProfileInfoComponent } from './profile-info/profile-info.component';
import { AddressInfoComponent } from './address-info/address-info.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';
import { TranslateModule } from '@ngx-translate/core';

type Tab = 'profile' | 'security' | 'address';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ProfileInfoComponent, 
    AddressInfoComponent,
    SecuritySettingsComponent,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private accountService = inject(AccountService);
  
  activeTab = signal<Tab>('profile');

  ngOnInit(): void {
    if (!this.accountService.currentUser()) {
      this.accountService.getMe().subscribe();
    }
  }

  setActiveTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
