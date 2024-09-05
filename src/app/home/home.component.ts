import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { SwapyAppComponent } from '../swapy-app/swapy-app.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, SwapyAppComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private router: Router) {}

  createVideoRoom() {
    const roomId = uuidv4();
    this.router.navigate(['/room', roomId]);
  }

  createAudioRoom() {
    const roomId = uuidv4();
    this.router.navigate(['/audio-room', roomId]);
  }
}
