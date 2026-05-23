import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, TranslateModule],
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.scss'
})
export class CareersComponent {

}
