import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import Peer from 'peerjs';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css',
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  private peer: Peer;
  private myStream: MediaStream | undefined;
  private roomId: string | null = null;
  public users: string[] = [];
  private remoteStreams: Map<string, HTMLVideoElement> = new Map();
  volume: number = 1;

  constructor(
    private route: ActivatedRoute,
    private socket: Socket,
    private router: Router
  ) {
    this.peer = new Peer();
  }

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    this.joinRoom();
  }

  async joinRoom() {
    try {
      this.myStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.localVideo.nativeElement.srcObject = this.myStream;

      this.peer.on('open', (userId) => {
        this.socket.emit('join-room', this.roomId, userId);
      });

      this.peer.on('call', (call) => {
        call.answer(this.myStream);
        call.on('stream', (remoteStream) => {
          this.addVideoStream(call.peer, remoteStream);
        });
      });

      // this.socket.on('user-connected', (userId: string) => {
      //   this.connectToNewUser(userId, this.myStream);
      // });

      // this.socket.on('user-disconnected', (userId: string) => {
      //   console.log('User disconnected:', userId);
      //   // Implement logic to remove the disconnected user's video
      // });

      this.socket.on('user-connected', (userId: string) => {
        this.connectToNewUser(userId, this.myStream);
      });

      this.socket.on('user-disconnected', (userId: string) => {
        this.removeVideoStream(userId);
      });

      this.socket.on('room-users', (users: string[]) => {
        this.users = users;
        console.log('Users in room:', this.users);
      });
    } catch (err) {
      console.error('Failed to get local stream', err);
    }
  }

  connectToNewUser(userId: string, stream: MediaStream | undefined) {
    if (stream) {
      const call = this.peer.call(userId, stream);
      call.on('stream', (remoteStream) => {
        this.addVideoStream(userId, remoteStream);
      });
    } else {
      console.error('Stream is undefined');
    }
  }

  addVideoStream(userId: string, stream: MediaStream) {
    if (!this.remoteStreams.has(userId)) {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      this.remoteStreams.set(userId, video);
      document.getElementById('remoteVideos')?.appendChild(video);
    }
  }

  removeVideoStream(userId: string) {
    const video = this.remoteStreams.get(userId);
    if (video) {
      video.remove();
      this.remoteStreams.delete(userId);
    }
  }

  endCall() {
    if (this.myStream) {
      this.myStream.getTracks().forEach((track) => track.stop());
    }
    this.remoteStreams.forEach((video) => video.remove());
    this.remoteStreams.clear();
    this.socket.disconnect();
    this.peer.destroy();
    this.router.navigate(['/']);
  }

  adjustVolume(event: Event) {
    const volume = (event.target as HTMLInputElement).value;
    const remoteVideos = document.getElementById('remoteVideos');
    if (remoteVideos) {
      const videos = remoteVideos.getElementsByTagName('video');
      for (let i = 0; i < videos.length; i++) {
        (videos[i] as HTMLVideoElement).volume = parseFloat(volume);
      }
    }
  }
  ngAfterViewInit() {
    if (this.localVideo && this.localVideo.nativeElement) {
      this.localVideo.nativeElement.muted = true;
    }
  }

  ngOnDestroy() {
    this.endCall();
  }
}
