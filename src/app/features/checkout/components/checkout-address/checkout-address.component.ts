import { Component, OnInit, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../../../core/services/checkout/checkout.service';
import { AccountService } from '../../../../core/services/account/account.service';
import { UiFeedbackService } from '../../../../core/services/ui-feedback.service';
import { Address } from '../../../../shared/models/auth';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './checkout-address.component.html'
})
export class CheckoutAddressComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private checkoutService = inject(CheckoutService);
  private ui = inject(UiFeedbackService);
  private translate = inject(TranslateService);

  addressForm: FormGroup;
  isEditing = signal(false);
  isSaving = signal(false);

  constructor() {
    this.addressForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAddress();
  }

  loadAddress() {
    this.accountService.getAddress().subscribe({
      next: (address) => {
        if (address) {
          this.addressForm.patchValue(address);
          this.checkoutService.updateShippingAddress(address);
        } else {
            this.isEditing.set(true);
        }
      },
      error: (err) => {
        this.isEditing.set(true);
      }
    });
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.loadAddress();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.addressForm.get(field);
    return !!(control && control.invalid && (control.dirty && control.touched));
  }

  saveAddress() {
    if (this.addressForm.invalid) {
        this.addressForm.markAllAsTouched();
        return;
    }

    this.isSaving.set(true);
    let address: Address = this.addressForm.value;

    if (!address.id || address.id === '0' || Number(address.id) === 0) {
      address.id = this.createUUID();
      this.addressForm.patchValue({ id: address.id });
    }

    this.accountService.updateAddress(address).subscribe({
      next: () => {
        this.ui.success(this.translate.instant('checkout.address.saveSuccess'), this.translate.instant('checkout.address.successTitle'));
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.checkoutService.updateShippingAddress(address);
      },
      error: (err) => {
        this.ui.error(err.error?.message || this.translate.instant('checkout.address.saveFailed'));
        this.isSaving.set(false);
      }
    });
  }

  private createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  
  @Component({
    selector: 'app-checkout-address'
  })
  
  @Output() next = new EventEmitter<void>();

  proceedToDelivery() {
    if (this.addressForm.valid) {
        this.checkoutService.updateShippingAddress(this.addressForm.value);
        this.next.emit();
    }
  }
}