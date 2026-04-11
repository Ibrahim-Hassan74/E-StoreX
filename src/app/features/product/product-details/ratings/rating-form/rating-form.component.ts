import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Rating, RatingRequest } from '../../../../../shared/models/rating';

@Component({
  selector: 'app-rating-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './rating-form.component.html',
  styleUrl: './rating-form.component.scss'
})
export class RatingFormComponent {
  private fb = inject(FormBuilder);

  userRating = input<Rating | null>(null);
  isLoading = input<boolean>(false);
  
  save = output<{score: number, comment: string}>();
  delete = output<void>();

  isEditing = signal<boolean>(false);
  hoveredStar = signal<number>(0);

  form = this.fb.group({
    score: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.maxLength(500)]]
  });

  constructor() {
    effect(() => {
      const rating = this.userRating();
      if (rating) {
        this.form.patchValue({
          score: rating.score,
          comment: rating.comment
        });
        this.isEditing.set(false); 
      } else {
        this.form.reset({ score: 0, comment: '' });
        this.isEditing.set(true); 
      }
    });
  }

  get currentScore(): number {
    return this.form.get('score')?.value || 0;
  }

  setRating(score: number) {
    if (this.isEditing()) {
      this.form.patchValue({ score });
    }
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    const rating = this.userRating();
    if (rating) {
      this.form.patchValue({
        score: rating.score,
        comment: rating.comment
      });
      this.isEditing.set(false);
    } else {
      this.form.reset();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit({
      score: this.form.value.score!,
      comment: this.form.value.comment!
    });
  }

  onDelete() {
    this.delete.emit();
  }
}
