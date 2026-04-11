import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { LocationService } from '../../../../services/location/location.service';
import { switchMap, finalize } from 'rxjs/operators';
import { UiFeedbackService } from '../../../../services/ui-feedback.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar-location',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './navbar-location.component.html',
  styleUrl: './navbar-location.component.scss',
})
export class NavbarLocationComponent {
  private locationService = inject(LocationService);
  private ui = inject(UiFeedbackService); // Assuming we can use this for errors

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
        this.updateMapMarker(coords.latitude, coords.longitude);
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

  // Placeholder for map marker update as requested
  private updateMapMarker(lat: number, lng: number) {
    console.log(`Map marker updated to: ${lat}, ${lng}`);
    // Actual map implementation would go here, e.g.:
    // this.map.setCenter({ lat, lng });
    // this.marker.setPosition({ lat, lng });
  }
}
