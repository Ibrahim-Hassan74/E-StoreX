import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

interface Partner {
  name: string;
  icon: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent {
  partners: Partner[] = [
    {
      name: 'Stripe',
      icon: 'credit-card',
      category: 'Payments',
      description: 'Handling secure global transactions and subscriptions.'
    },
    {
      name: 'EmailJS',
      icon: 'mail',
      category: 'Communication',
      description: 'Client-side email delivery system for contact forms.'
    },
    {
      name: 'Google Auth',
      icon: 'shield',
      category: 'Authentication',
      description: 'Secure open standard authorization.'
    },
    {
      name: 'GitHub',
      icon: 'github',
      category: 'DevOps',
      description: 'Source code management and version control.'
    },
    {
      name: 'Angular',
      icon: 'code',
      category: 'Frontend',
      description: 'The modern web developer\'s platform.'
    },
    {
      name: '.NET Core',
      icon: 'server',
      category: 'Backend',
      description: 'High-performance, cross-platform framework.'
    },
    {
      name: 'Redis',
      icon: 'database',
      category: 'Cache',
      description: 'In-memory data structure store for high speed.'
    },
    {
      name: 'Tailwind CSS',
      icon: 'palette',
      category: 'Styling',
      description: 'Utility-first CSS framework for rapid UI development.'
    }
  ];

  getPartnerKey(partnerName: string, field: 'category' | 'description'): string {
    const key = partnerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `partners.list.${key}.${field}`;
  }
}
