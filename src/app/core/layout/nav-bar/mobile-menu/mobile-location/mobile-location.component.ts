import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LocationService } from '../../../../services/location/location.service';
import { UiFeedbackService } from '../../../../services/ui-feedback.service';
import { finalize, switchMap } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-location',
  imports: [RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './mobile-location.component.html',
  styleUrl: './mobile-location.component.scss',
})
export class MobileLocationComponent {
  private locationService = inject(LocationService);
  private ui = inject(UiFeedbackService);

  isLocationOpen = signal(false);
  isLoading = signal(false);
  currentAddress = signal<string | null>(null);

  toggleLocation() {
    this.isLocationOpen.update((l) => !l);
  }
  closeLocation() {
    this.isLocationOpen.set(false);
  }

  detectMyLocation() {
    this.isLoading.set(true);

    this.locationService.getCurrentPosition().pipe(
      switchMap(coords => {
        return this.locationService.reverseGeocode(coords.latitude, coords.longitude);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (address) => {
        this.currentAddress.set(address);
        this.closeLocation();
      },
      error: (err) => {
        this.ui.error(err.message || 'Failed to detect location', 'Location Error');
      }
    });
  }
}
