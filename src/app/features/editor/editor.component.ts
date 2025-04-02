import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService, Task } from '../../core/services/task.service';
import { PopupComponent, PopupData } from '../../shared/components/popup/popup.component';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [SharedModule, MatButtonModule, TranslocoModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  tasks: Task[] = [];

  constructor(private taskService: TaskService, private dialog: MatDialog, private snackBar: MatSnackBar) {
    this.loadTasks();
  }

  loadTasks() {
    this.tasks = this.taskService.getTasks();
  }

  getNextId(): number {
    return this.tasks.length > 0 ? Math.max(...this.tasks.map(task => task.id)) + 1 : 1;
  }

  openPopup(type: 'add' | 'copy' | 'delete', task?: Task) {
    const baseForm = type === 'add' ? {
      id: this.getNextId(),
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      dueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    } : {
      id: undefined,
      title: '',
      description: '',
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      dueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const data: PopupData = {
      title: type === 'add' ? 'Добавить задачу' : type === 'copy' ? 'Копировать задачу' : 'Удалить задачу',
      type,
      confirmButtonText: type === 'delete'
        ? 'Удалить'
        : type === 'add'
          ? 'Добавить'
          : 'Копировать'
      ,
      form: baseForm,
      tasks: type !== 'add' ? this.tasks.map(t => ({ id: t.id, title: t.title })) : undefined
    };

    const dialogRef = this.dialog.open(PopupComponent, { width: '600px', data });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type === 'add') {
          this.taskService.addTask(result);
          this.tasks.push(result);
          this.snackBar.open('Задача добавлена', 'Закрыть', { duration: 3000 });
        } else {
          const existingTask = this.tasks.find(t => t.id === result.id);

          if (!existingTask) {
            this.snackBar.open('Задача не найдена', 'Закрыть', { duration: 3000 });
            return;
          }

          if (type === 'copy') {
            // Копируем все данные из существующей задачи
            const copiedTask = {
              ...existingTask,
              id: this.getNextId(),
              title: `${existingTask.title} (копия)`,
              createdAt: new Date().toISOString()
            };
            this.tasks.push(copiedTask);
            this.taskService.addTask(copiedTask);
            this.snackBar.open('Задача скопирована', 'Закрыть', { duration: 3000 });
          } else if (type === 'delete') {
            this.taskService.deleteTask(existingTask.id);
            this.tasks = this.tasks.filter(t => t.id !== existingTask.id);
            this.snackBar.open('Задача удалена', 'Закрыть', { duration: 3000 });
          }
        }
        this.loadTasks();
      }
    });
  }
}