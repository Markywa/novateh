import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RequestService } from '../../services/request/request.service';

@Component({
  selector: 'app-question-modal',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      MatDialogModule,
      FormsModule,
    ],
  templateUrl: './question-modal.component.html',
  styleUrl: './question-modal.component.scss'
})
export class QuestionModalComponent {
  private requestService = inject(RequestService);

  public formData = {
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false  // ← добавить эту строку
  };

  constructor(
    public dialogRef: MatDialogRef<QuestionModalComponent>,
  ) {}

  onSubmit() {
    // Дополнительная проверка перед отправкой
    if (this.validateForm()) {
      this.requestService.sendRequest(this.formData).subscribe({
        complete: () => {
          this.dialogRef.close(this.formData);
        },
        error: (error) => {
          console.error('Ошибка при отправке:', error);
          // Здесь можно добавить уведомление об ошибке
        }
      });
    }
  }

  private validateForm(): boolean {
    const nameValid = this.formData.name && this.formData.name.trim().length >= 2 && this.formData.name.trim().length <= 50;
    const phoneValid = /^\+?[0-9]{10,15}$/.test(this.formData.phone);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email);
    const messageValid = this.formData.message && this.formData.message.trim().length >= 10 && this.formData.message.trim().length <= 1000;
    
    return (nameValid && phoneValid && emailValid && messageValid) as boolean;
  }

  onClose() {
    this.dialogRef.close();
  }
}