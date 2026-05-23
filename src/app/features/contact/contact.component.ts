import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ContactService, ContactMessage } from '../../core/services/contact/contact.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactService);
  private uiFeedback = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isLoading = signal(false);

  socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/ibrahim-hassan-48287b250',
      icon: 'linkedin',
      display: 'Ibrahim Hassan'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/Ibrahim-Hassan74',
      icon: 'github',
      display: 'Ibrahim-Hassan74'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1bxtDtRTFp',
      icon: 'facebook',
      display: 'Ibrahim Hassan'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ibrahim_hassan_72?igsh=eXdsb3BlZGk4emh0',
      icon: 'instagram',
      display: 'Ibrahim Hassan'
    }
  ];

  contactInfo = [
    {
      label: 'contact.info.email',
      value: 'ibrahimhassan.dev1@gmail.com',
      icon: 'mail',
      link: 'mailto:ibrahimhassan.dev1@gmail.com',
      isLocalizedValue: false
    },
    {
      label: 'contact.info.phone',
      value: '+20 102 799 2904',
      icon: 'phone',
      link: 'tel:+201027992904',
      isLocalizedValue: false
    },
    {
      label: 'contact.info.location',
      value: 'contact.info.minyaEgypt',
      icon: 'map-pin',
      link: null,
      isLocalizedValue: true
    }
  ];

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && field.dirty);
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const messageData: ContactMessage = this.contactForm.value as ContactMessage;

    this.contactService.sendMessage(messageData).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.contactForm.reset();
        this.uiFeedback.success(
          this.translate.instant('contact.alerts.successText'),
          this.translate.instant('contact.alerts.successTitle')
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Message send failed', err);
        const errorMessage = err.error?.message || this.translate.instant('contact.alerts.failedText');
        this.uiFeedback.error(
          errorMessage,
          this.translate.instant('contact.alerts.failedTitle')
        );
      }
    });
  }
}
