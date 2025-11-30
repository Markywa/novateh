import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-request-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './request-modal.component.html',
  styleUrl: './request-modal.component.scss'
})
export class RequestModalComponent {
  public formData = {
    name: '',
    phone: '',
  };

  constructor(
    public dialogRef: MatDialogRef<RequestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
