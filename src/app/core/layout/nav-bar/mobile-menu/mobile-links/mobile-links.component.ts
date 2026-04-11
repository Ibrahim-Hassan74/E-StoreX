import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-links',
  imports: [RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './mobile-links.component.html',
  styleUrl: './mobile-links.component.scss',
})
export class MobileLinksComponent {}
