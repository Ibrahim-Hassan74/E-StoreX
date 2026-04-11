import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer-column',
  imports: [RouterLink, TranslateModule],
  templateUrl: './footer-column.component.html',
  styleUrl: './footer-column.component.scss',
})
export class FooterColumnComponent {
  title = input.required<string>();
  links = input.required<{ label: string; route: string }[]>();
}
