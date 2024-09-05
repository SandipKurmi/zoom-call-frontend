import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { AudioRoomComponent } from './audio-room/audio-room.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'room/:roomId',
    loadComponent: () =>
      import('./room/room.component').then((c) => c.RoomComponent),
  },
  {
    path: 'audio-room/:roomId',
    loadComponent: () =>
      import('./audio-room/audio-room.component').then(
        (c) => c.AudioRoomComponent
      ),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
