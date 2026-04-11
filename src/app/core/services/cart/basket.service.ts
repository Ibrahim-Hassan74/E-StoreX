import { Injectable, inject } from '@angular/core';
import { ResourceService } from '../resource.service';
import { TranslateService } from '@ngx-translate/core';
import { Basket, BasketItem } from '../../../shared/models/basket';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BasketService extends ResourceService<Basket> {
  private translate = inject(TranslateService);
  constructor() {
    super('Baskets');
  }

  getBasket(id: string): Observable<Basket> {
    return this.getById(id).pipe(this.mapBasketResponse());
  }

  addBasket(basketItem: BasketItem, basketId: string): Observable<Basket> {
    const payload = {
      basketItem: {
        ...basketItem,
        qunatity: basketItem.quantity
      },
      basketId
    };
    
    return this.post<any>('', payload).pipe(
      tap({
        error: (err) => console.error(this.translate.instant('services.basket.addBasketError'), JSON.stringify(err.error, null, 2))
      }),
      this.mapBasketResponse()
    );
  }

  deleteBasket(id: string): Observable<void> {
    return this.delete(id);
  }

  private mapBasketResponse() {
    return map((basket: any) => {
        if (basket && basket.basketItems) {
           basket.basketItems = basket.basketItems.map((item: any) => ({
             ...item,
             quantity: item.qunatity || item.quantity
           }));
        }
        return basket as Basket;
    });
  }

  mergeBasket(guestId: string): Observable<Basket> {
    return this.post(`merge`, {}, { params: { guestId } }).pipe(this.mapBasketResponse());
  }

  increaseItem(basketId: string, itemId: string): Observable<Basket> {
    return this.http.patch<Basket>(
      this.buildUrl(`${basketId}/items/${itemId}/increase`),
      {}
    ).pipe(this.mapBasketResponse());
  }

  decreaseItem(basketId: string, itemId: string): Observable<Basket> {
    return this.http.patch<Basket>(
      this.buildUrl(`${basketId}/items/${itemId}/decrease`),
      {}
    ).pipe(this.mapBasketResponse());
  }

  removeItem(basketId: string, itemId: string): Observable<Basket> {
    return this.http.delete<Basket>(
      this.buildUrl(`${basketId}/items/${itemId}`)
    ).pipe(this.mapBasketResponse());
  }

  applyDiscount(basketId: string, code: string): Observable<Basket> {
    return this.post(`${basketId}/apply-discount/${code}`).pipe(this.mapBasketResponse());
  }
}
