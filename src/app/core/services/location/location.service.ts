import { HttpClient } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Observer, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  getCurrentPosition(): Observable<LocationCoordinates> {
    return new Observable((observer: Observer<LocationCoordinates>) => {
      if (!isPlatformBrowser(this.platformId)) {
        observer.error(new Error(this.translate.instant('services.location.serverGeolocationUnavailable')));
        return;
      }

      if (!navigator.geolocation) {
        observer.error(new Error(this.translate.instant('services.location.browserGeolocationUnsupported')));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          observer.complete();
        },
        (error) => {
          let errorMessage = this.translate.instant('services.location.unknownError');
          switch (error.code) {
            case error.PERMISSION_DENIED:
              if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                 errorMessage = this.translate.instant('services.location.secureConnectionRequired');
              } else {
                 errorMessage = this.translate.instant('services.location.userDenied');
              }
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = this.translate.instant('services.location.locationUnavailable');
              break;
            case error.TIMEOUT:
              errorMessage = this.translate.instant('services.location.timeout');
              break;
          }
          observer.error(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.address) {
          const addr = response.address;
          const part1 = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood;
          const part2 = addr.city || addr.town || addr.village || addr.county || addr.state;
          
          if (part1 && part2) {
            return `${part1}, ${part2}`;
          } else if (part2) {
            return part2; 
          }
        }
        return (response.display_name || this.translate.instant('services.location.unknownLocation')).split(',').slice(0, 3).join(',');
      }),
      catchError(error => {
        console.error('Reverse geocoding failed', error);
        return throwError(() => new Error(this.translate.instant('services.location.failedRetrieveAddress')));
      })
    );
  }
}
