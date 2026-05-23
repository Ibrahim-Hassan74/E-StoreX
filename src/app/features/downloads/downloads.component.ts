import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslateModule],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss'
})
export class DownloadsComponent {

}
