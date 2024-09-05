import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioRoomComponent } from './audio-room.component';

describe('AudioRoomComponent', () => {
  let component: AudioRoomComponent;
  let fixture: ComponentFixture<AudioRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
