import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar-links',
  imports: [RouterModule, TranslateModule],
  templateUrl: './navbar-links.component.html',
  styleUrl: './navbar-links.component.scss',
})
export class NavbarLinksComponent {}
