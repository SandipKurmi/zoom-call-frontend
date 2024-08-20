import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'room/:roomId', component: RoomComponent },
];
