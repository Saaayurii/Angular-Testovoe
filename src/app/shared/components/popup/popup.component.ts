import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewChild } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

export interface PopupData {
  title: string;
  type: string;
  confirmButtonText?: string;
  tasks?: Array<{id: number, title: string}>;
  form: {
    id?: number;
    title: string;
    description: string;
    createdAt: string;
    dueDate: string;
    dueTime: string;
  };
}

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    TranslocoModule
  ],
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  @ViewChild('taskForm') taskForm: NgForm | undefined;
  
  // Ошибки валидации
  validationErrors = {
    id: "",
    title: '',
    description: '',
    dueDate: '',
    dueTime: ''
  };
  
  // Флаг, указывающий, была ли попытка отправить форму
  submitted = false;
  taskExists = false;
  selectedTask: {id: number, title: string} | null = null;

  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData
  ) { }

  ngOnInit(): void {
    // Инициализируем форму для "delete" или "copy" с пустыми значениями, 
    // так как пользователь должен сначала найти задачу
    if (this.data.type === 'delete' || this.data.type === 'copy') {
      this.data.form = {
        id: undefined,
        title: '',
        description: '',
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        dueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  
  findTask(): void {
    if (!this.data.tasks) return;
    
    const foundTask = this.data.tasks.find(
      task => task.id === this.data.form.id && task.title === this.data.form.title
    );
    
    this.taskExists = !!foundTask;
    this.selectedTask = foundTask || null;
    
    if (!this.taskExists) {
      this.validationErrors.id = "Задача с указанным ID и названием не найдена";
    } else {
      this.validationErrors.id = "";
    }
  }
  
  onTaskSelect(event: any): void {
    if (this.selectedTask) {
      this.data.form.id = this.selectedTask.id;
      this.data.form.title = this.selectedTask.title;
      this.taskExists = true;
    }
  }

  validateForm(): boolean {
    this.submitted = true;
    let isValid = true;
    
    // Сбросим ошибки
    this.validationErrors = {
      id: "",
      title: '',
      description: '',
      dueDate: '',
      dueTime: ''
    };
    
    // Для "копирования" и "удаления" проверяем, существует ли задача
    if ((this.data.type === 'delete' || this.data.type === 'copy') && !this.taskExists) {
      this.validationErrors.id = "Задача с указанным ID и названием не найдена";
      isValid = false;
      return isValid;
    }
    
    // Для других типов диалогов используем обычную валидацию
    if (this.data.type === 'add' || this.data.type === 'view') {
      // Валидация заголовка
      if (!this.data.form.title || this.data.form.title.trim() === '') {
        this.validationErrors.title = 'Заголовок обязателен';
        isValid = false;
      } else if (this.data.form.title.length > 100) {
        this.validationErrors.title = 'Заголовок не должен превышать 100 символов';
        isValid = false;
      }
      
      // Валидация описания
      if (this.data.form.description && this.data.form.description.length > 500) {
        this.validationErrors.description = 'Описание не должно превышать 500 символов';
        isValid = false;
      }
      
      // Валидация даты выполнения
      if (!this.data.form.dueDate) {
        this.validationErrors.dueDate = 'Дата выполнения обязательна';
        isValid = false;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(this.data.form.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          this.validationErrors.dueDate = 'Дата выполнения не может быть в прошлом';
          isValid = false;
        }
      }
      
      // Валидация времени выполнения
      if (!this.data.form.dueTime) {
        this.validationErrors.dueTime = 'Время выполнения обязательно';
        isValid = false;
      }
    }
    
    return isValid;
  }

  confirmAction(): void {
    if (this.validateForm()) {
      // Если это удаление или копирование, убедимся, что мы выбрали задачу
      if ((this.data.type === 'delete' || this.data.type === 'copy') && !this.taskExists) {
        return;
      }
      
      this.dialogRef.close({
        ...this.data.form,
        dueDate: new Date(this.data.form.dueDate).toISOString(),
        dueTime: this.data.form.dueTime,
        createdAt: new Date(this.data.form.createdAt).toISOString()
      });
    }
  }
}