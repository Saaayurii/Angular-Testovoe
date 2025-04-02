import { Routes } from '@angular/router';
import { ViewerComponent } from './features/viewer/viewer.component';
import { EditorComponent } from './features/editor/editor.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'viewer', component: ViewerComponent },
    { path: 'editor', component: EditorComponent },
];


