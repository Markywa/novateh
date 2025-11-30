import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  public formData = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };

  constructor(
    public dialogRef: MatDialogRef<QuestionModalComponent>,
  ) {}

  onSubmit() {
    // Здесь можно отправить данные на сервер или обработать
    console.log('Форма отправлена:', this.formData);
    this.dialogRef.close(this.formData);
  }

  onClose() {
    this.dialogRef.close();
  }
}
