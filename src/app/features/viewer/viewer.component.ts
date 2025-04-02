import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService, Task } from '../../core/services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupComponent, PopupData } from '../../shared/components/popup/popup.component';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [
    SharedModule, MatButtonModule, MatTableModule, MatIconModule, 
    MatMenuModule, MatPaginatorModule, CommonModule, TranslocoModule
  ],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Task>;
  displayedColumns: string[] = ['title', 'createdAt', 'dueDate', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private cdRef: ChangeDetectorRef,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<Task>([]);
  }

  ngOnInit() {
    this.loadTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  get tasks(): Task[] {
    return this.dataSource.data;
  }

  loadTasks() {
    const tasks = this.taskService.getTasks();
    this.dataSource.data = tasks;
    this.cdRef.markForCheck();
  }

  openPopup(task: Task) {
    const data: PopupData = {
      title: 'Просмотр задачи',
      type: 'view',
      form: {
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: '',
        createdAt: task.createdAt
      }
    };

    this.dialog.open(PopupComponent, { width: '800px', data });
  }

  moveTaskUp(task: Task) {
    const tasksCopy = [...this.tasks];
    const index = tasksCopy.findIndex(t => t.id === task.id);

    if (index > 0) {
      [tasksCopy[index], tasksCopy[index - 1]] = [tasksCopy[index - 1], tasksCopy[index]];
      this.dataSource.data = tasksCopy;
      this.taskService.saveTasks(tasksCopy);
      this.cdRef.detectChanges();
    }
  }

  moveTaskDown(task: Task) {
    const tasksCopy = [...this.tasks];
    const index = tasksCopy.findIndex(t => t.id === task.id);

    if (index < tasksCopy.length - 1) {
      [tasksCopy[index], tasksCopy[index + 1]] = [tasksCopy[index + 1], tasksCopy[index]];
      this.dataSource.data = tasksCopy;
      this.taskService.saveTasks(tasksCopy);
      this.cdRef.detectChanges();
    }
  }

  async goToNextPage() {
    await this.router.navigate(['/editor']);
  }
}
