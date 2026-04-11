import { Component, Input, OnInit, inject, signal, computed, input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RatingsService } from '../../../../core/services/ratings/ratings.service';
import { AccountService } from '../../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../../core/services/ui-feedback.service';
import { Rating, RatingRequest, RatingSummary } from '../../../../shared/models/rating';

import { RatingSummaryComponent } from './rating-summary/rating-summary.component';
import { RatingListComponent } from './rating-list/rating-list.component';
import { RatingFormComponent } from './rating-form/rating-form.component';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    LucideAngularModule,
    RatingSummaryComponent,
    RatingListComponent,
    RatingFormComponent,
    TranslateModule
  ],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss'
})
export class RatingsComponent implements OnInit {
  private ratingsService = inject(RatingsService);
  private accountService = inject(AccountService);
  private uiFeedback = inject(UiFeedbackService);
  private translate = inject(TranslateService);
  public router = inject(Router);

  // @Input({ required: true }) productId!: string;
  productId = input.required<string>();

  ratings = signal<Rating[]>([]);
  summary = signal<RatingSummary | null>(null);
  userRating = signal<Rating | null>(null);
  
  isLoading = signal<boolean>(false);
  isActionLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  currentUser = this.accountService.currentUser;
  isLoggedIn = computed(() => !!this.currentUser());

  ngOnInit(): void {
    if (this.productId()) {
      this.loadAllData();
    }
  }

  loadAllData() {
    this.isLoading.set(true);
    
    this.loadSummary();
    this.loadRatings();
    
    if (this.isLoggedIn()) {
      this.loadUserRating();
    }
  }

  loadSummary() {
    this.ratingsService.getRatingSummary(this.productId()).subscribe({
      next: (summary) => this.summary.set(summary),
      error: () => console.log('No summary')
    });
  }

  loadRatings() {
    this.ratingsService.getProductRatings(this.productId()).subscribe({
      next: (ratings) => {
        this.ratings.set(ratings);
        this.isLoading.set(false);
      },
      error: (err) => { 
        console.error(err); 
        this.isLoading.set(false);
      }
    });
  }

  loadUserRating() {
    this.ratingsService.getUserRating(this.productId()).subscribe({
      next: (rating) => this.userRating.set(rating || null),
      error: () => {
        this.userRating.set(null)
        console.log('No rating found');
      } 
    });
  }

  onSaveRating(data: { score: number, comment: string }) {
    this.isActionLoading.set(true);
    this.errorMessage.set(null);

    const request: RatingRequest = {
      productId: this.productId(),
      score: data.score,
      comment: data.comment
    };

    const currentRating = this.userRating();
    if (currentRating) {
      this.ratingsService.updateRating(currentRating.id, request).subscribe({
        next: () => {
          this.isActionLoading.set(false);
          this.uiFeedback.success(this.translate.instant('product.ratings.messages.updateSuccess'));
          
          const updatedRating = { ...currentRating, score: data.score, comment: data.comment };
          this.userRating.set(updatedRating);
          
          this.ratings.update(ratings => 
            ratings.map(r => r.id === currentRating.id ? updatedRating : r)
          );
          
          this.recalculateSummary('update', currentRating, request);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.ratingsService.createRating(request).subscribe({
        next: (newRating) => {
          this.isActionLoading.set(false);
          this.uiFeedback.success(this.translate.instant('product.ratings.messages.createSuccess'));

          this.userRating.set(newRating);
          this.ratings.update(ratings => [newRating, ...ratings]);
          
          this.recalculateSummary('create', null, request);
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  async onDeleteRating() {
    const currentRating = this.userRating();
    if (!currentRating) return;

    const confirmed = await this.uiFeedback.confirm(this.translate.instant('product.ratings.messages.deleteConfirm'));
    if (!confirmed) return;

    this.isActionLoading.set(true);
    this.ratingsService.deleteRating(currentRating.id).subscribe({
      next: () => {
        this.ratings.update(ratings => ratings.filter(r => r.id !== currentRating.id));
        this.userRating.set(null);
        
        this.recalculateSummary('delete', currentRating, null);
        
        this.isActionLoading.set(false);
        this.uiFeedback.success(this.translate.instant('product.ratings.messages.deleteSuccess'));
      },
      error: (err) => {
        this.isActionLoading.set(false);
        this.errorMessage.set(err.error?.message || this.translate.instant('product.ratings.messages.deleteError'));
      }
    });
  }

  private recalculateSummary(action: 'create' | 'update' | 'delete', oldRating: Rating | null, newRating: RatingRequest | null) {
    this.summary.update(current => {
      if (!current) {
        if (action === 'create' && newRating) {
           return {
             averageScore: newRating.score,
             totalRatings: 1,
             scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, [newRating.score]: 1 }
           } as RatingSummary;
        }
        return current;
      }

      let { averageScore, totalRatings, scoreDistribution } = current;
      let sum = averageScore * totalRatings;
      const dist = { ...scoreDistribution };

      if (action === 'create' && newRating) {
        totalRatings++;
        sum += newRating.score;
        dist[newRating.score as keyof typeof dist] = (dist[newRating.score as keyof typeof dist] || 0) + 1;
      } else if (action === 'update' && oldRating && newRating) {
        sum = sum - oldRating.score + newRating.score;
        dist[oldRating.score as keyof typeof dist]--;
        dist[newRating.score as keyof typeof dist] = (dist[newRating.score as keyof typeof dist] || 0) + 1;
      } else if (action === 'delete' && oldRating) {
        totalRatings--;
        sum -= oldRating.score;
        dist[oldRating.score as keyof typeof dist]--;
      }

      averageScore = totalRatings > 0 ? sum / totalRatings : 0;

      return {
        averageScore,
        totalRatings,
        scoreDistribution: dist
      };
    });
  }

  handleError(err: any) {
    this.isActionLoading.set(false);
    this.errorMessage.set(err.error?.message || this.translate.instant('product.ratings.messages.operationFailed'));
    setTimeout(() => this.errorMessage.set(null), 3000);
  }
}
