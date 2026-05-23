import { Component, input, output, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export interface CropResult {
  blob: Blob;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  zoom: number;
}

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, LucideAngularModule, TranslateModule],
  templateUrl: './image-cropper-modal.component.html'
})
export class ImageCropperModalComponent {
  private translate = inject(TranslateService);

  imageFile = input<File | undefined>(undefined);
  save = output<CropResult>();
  cancel = output<void>();

  @ViewChild(ImageCropperComponent) imageCropper?: ImageCropperComponent;

  zoom = signal(1);
  croppedImage: any = '';
  currentCropEvent: ImageCroppedEvent | null = null;
  errorMessage = signal<string | null>(null);

  imageLoaded(image: LoadedImage) {
    this.errorMessage.set(null);
  }

  cropperReady() {
  }

  loadImageFailed() {
    console.error('Load image failed');
    this.errorMessage.set(this.translate.instant('account.profile.cropLoadFailed'));
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl;
    this.currentCropEvent = event;
  }

  onZoomChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.zoom.set(parseFloat(input.value));
  }

  onSave() {
    if (this.currentCropEvent && this.currentCropEvent.blob) {
      this.save.emit({
        blob: this.currentCropEvent.blob,
        cropX: this.currentCropEvent.imagePosition.x1,
        cropY: this.currentCropEvent.imagePosition.y1,
        cropWidth: this.currentCropEvent.imagePosition.x2 - this.currentCropEvent.imagePosition.x1,
        cropHeight: this.currentCropEvent.imagePosition.y2 - this.currentCropEvent.imagePosition.y1,
        zoom: this.zoom()
      });
    }
  }
}
