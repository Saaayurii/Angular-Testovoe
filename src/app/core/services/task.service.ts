import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  dueTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private storageKey = 'tasks';
  private destroy$ = new Subject<void>();
  private checkInterval = 30000; // Check every minute

  constructor(private snackBar: MatSnackBar) {
    this.initTasks();
    this.startDueTimeChecker();
  }

  // Проверка для SSR
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private initTasks(): void {
    if (this.isBrowser()) {
      const storedTasks = localStorage.getItem(this.storageKey);
      const defaultTasks: Task[] = [
        { id: 1, title: 'Задача 1', description: 'Описание 1', createdAt: new Date().toISOString(), dueDate: new Date().toISOString(), dueTime: new Date().toLocaleTimeString() },
        { id: 2, title: 'Задача 2', description: 'Описание 2', createdAt: new Date().toISOString(), dueDate: new Date().toISOString(), dueTime: new Date().toLocaleTimeString() },
        { id: 3, title: 'Задача 3', description: 'Описание 3', createdAt: new Date().toISOString(), dueDate: new Date().toISOString(), dueTime: new Date().toLocaleTimeString() },
        { id: 4, title: 'Задача 4', description: 'Описание 4', createdAt: new Date().toISOString(), dueDate: new Date().toISOString(), dueTime: new Date().toLocaleTimeString() },
        { id: 5, title: 'Задача 5', description: 'Описание 5', createdAt: new Date().toISOString(), dueDate: new Date().toISOString(), dueTime: new Date().toLocaleTimeString() },
      ];
      if (!storedTasks) {
        this.saveTasks(defaultTasks);
      }
    }
  }

  // Start a periodic check for due tasks
  startDueTimeChecker(): void {
    if (this.isBrowser()) {
      interval(this.checkInterval)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.checkDueTasks();
        });
    }
  }

  // Stop checking for due tasks
  stopDueTimeChecker(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Check if any tasks are due now
  private checkDueTasks(): void {
    const tasks = this.getTasks();
    const now = new Date();
    
    // Format current date as YYYY-MM-DD
    const currentDateStr = now.toISOString().split('T')[0];
    
    // Format current time as HH:MM
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    tasks.forEach(task => {
      // Format task due date as YYYY-MM-DD
      const taskDueDateStr = new Date(task.dueDate).toISOString().split('T')[0];
      
      // Format task due time as HH:MM
      const taskDueTimeStr = task.dueTime.substring(0, 5);
      
      // Check if the task is due now (same date and same time within the minute)
      if (taskDueDateStr === currentDateStr && taskDueTimeStr === currentTimeStr) {
        this.showTaskDueNotification(task);
      }
    });
  }

  // Show a notification for a due task
  private showTaskDueNotification(task: Task): void {
    this.snackBar.open(
      `Срок выполнения задачи "${task.title}" наступил!`, 
      'Закрыть', 
      {
        duration: 10000, // 10 seconds
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['task-due-notification']
      }
    );
  }

  getTasks(): Task[] {
    if (this.isBrowser()) {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }
    return [];
  }

  addTask(task: Task): void {
    if (this.isBrowser()) {
      const tasks = this.getTasks();
      tasks.push(task);
      this.saveTasks(tasks);
    }
  }

  updateTask(updatedTask: Task): void {
    if (this.isBrowser()) {
      let tasks = this.getTasks();
      tasks = tasks.map(task => (task.id === updatedTask.id ? updatedTask : task));
      this.saveTasks(tasks);
    }
  }

  deleteTask(id: number): void {
    if (this.isBrowser()) {
      let tasks = this.getTasks();
      tasks = tasks.filter(task => task.id !== id);
      this.saveTasks(tasks);
    }
  }

  saveTasks(tasks: Task[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }
  }
  
  // Call this method when the service is destroyed
  ngOnDestroy(): void {
    this.stopDueTimeChecker();
  }
}