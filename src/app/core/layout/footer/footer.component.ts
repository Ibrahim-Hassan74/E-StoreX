import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FooterColumnComponent } from './footer-column/footer-column.component';
import { RouterLink } from '@angular/router';
import { SocialLinksComponent } from './social-links/social-links.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [
    LucideAngularModule,
    FooterColumnComponent,
    RouterLink,
    SocialLinksComponent,
    TranslateModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  email = 'ibrahimhassan.dev1@gmail.com';
  currentYear: number = new Date().getFullYear();
  resources = [
    { label: 'layout.footer.links.product_catalog', route: '/product' },
    { label: 'layout.footer.links.help_center', route: '/help' },
    { label: 'layout.footer.links.privacy_terms', route: '/legal' },
  ];
  company = [
    { label: 'layout.footer.links.about', route: '/about' },
    { label: 'layout.footer.links.for_business', route: '/business' },
    { label: 'layout.footer.links.partners', route: '/partners' },
    { label: 'layout.footer.links.careers', route: '/careers' },
  ];
  account = [
    { label: 'layout.footer.links.create_account', route: '/auth/register' },
    { label: 'layout.footer.links.sign_in', route: '/auth/login' },
    { label: 'layout.footer.links.ios_app', route: '/mobile-app' },
    { label: 'layout.footer.links.android_app', route: '/mobile-app' },
  ];
  socialLinks = [
    {
      icon: 'instagram',
      url: 'https://www.instagram.com/ibrahim_hassan_72',
      hoverClass: 'text-pink-500 dark:hover:text-pink-400',
    },
    {
      icon: 'facebook',
      url: 'https://web.facebook.com/ibrahim.hassan.309765',
      hoverClass: 'text-blue-600 dark:hover:text-blue-400',
    },
    {
      icon: 'twitter',
      url: 'https://x.com/hema_official1',
      hoverClass: 'text-sky-500 dark:hover:text-sky-400',
    },
    {
      icon: 'github',
      url: 'https://github.com/Ibrahim-Hassan74',
      hoverClass: 'text-gray-900 dark:hover:text-gray-200',
    },
  ];
}
