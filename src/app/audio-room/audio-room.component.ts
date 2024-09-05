import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import Peer from 'peerjs';

@Component({
  selector: 'app-audio-room',
  standalone: true,
  imports: [],
  templateUrl: './audio-room.component.html',
  styleUrl: './audio-room.component.css',
})
export class AudioRoomComponent implements OnInit, OnDestroy {
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;

  private peer: Peer | null = null;
  private myStream: MediaStream | undefined;
  public roomId: string | null = null;
  public users: string[] = [];
  private remoteStreams: Map<string, HTMLAudioElement> = new Map();
  public volume: number = 0.8;
  public isAudioEnabled: boolean = true;
  public connectionError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private socket: Socket,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId');
    if (this.roomId) {
      this.initializePeerAndJoinRoom();
    }
  }

  async initializePeerAndJoinRoom(retryCount: number = 0) {
    try {
      this.peer = new Peer();
      await new Promise<void>((resolve, reject) => {
        this.peer!.on('open', () => resolve());
        this.peer!.on('error', (err) => reject(err));
      });
      await this.joinRoom();
    } catch (error) {
      console.error('Failed to initialize Peer or join room:', error);
      this.connectionError = `Failed to connect: ${error}. Retrying...`;
      if (retryCount < 3) {
        setTimeout(() => this.initializePeerAndJoinRoom(retryCount + 1), 2000);
      } else {
        this.connectionError =
          'Failed to connect after multiple attempts. Please try refreshing the page.';
      }
    }
  }

  async joinRoom() {
    try {
      this.myStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (this.peer && this.peer.id) {
        this.socket.emit('join-room', this.roomId, this.peer.id);
      } else {
        throw new Error('Peer not initialized');
      }

      this.setupPeerEventListeners();
      this.setupSocketEventListeners();
    } catch (err) {
      console.error('Failed to get local stream', err);
    }
  }

  setupPeerEventListeners() {
    this.peer!.on('call', (call) => {
      call.answer(this.myStream);
      call.on('stream', (remoteStream) => {
        this.addAudioStream(call.peer, remoteStream);
      });
    });
  }

  setupSocketEventListeners() {
    this.socket.on('user-connected', (userId: string) => {
      this.connectToNewUser(userId, this.myStream);
    });

    this.socket.on('user-disconnected', (userId: string) => {
      this.removeAudioStream(userId);
    });

    this.socket.on('room-users', (users: string[]) => {
      this.users = users;
      console.log('Users in room:', this.users);
    });
  }

  connectToNewUser(userId: string, stream: MediaStream | undefined) {
    if (stream) {
      if (this.peer && this.peer.id) {
        const call = this.peer.call(userId, stream);
        call.on('stream', (remoteStream) => {
          this.addAudioStream(userId, remoteStream);
        });
      }
    } else {
      console.error('Stream is undefined');
    }
  }

  addAudioStream(userId: string, stream: MediaStream) {
    if (!this.remoteStreams.has(userId)) {
      const audio = new Audio();
      audio.srcObject = stream;
      audio.addEventListener('loadedmetadata', () => {
        audio.play();
      });
      this.remoteStreams.set(userId, audio);
    }
  }

  removeAudioStream(userId: string) {
    const audio = this.remoteStreams.get(userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      this.remoteStreams.delete(userId);
    }
  }

  toggleAudio() {
    if (this.myStream) {
      const audioTrack = this.myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      this.isAudioEnabled = audioTrack.enabled;
    }
  }

  adjustVolume(event: Event) {
    const volumeValue = (event.target as HTMLInputElement).value;
    this.volume = parseFloat(volumeValue);
    this.remoteStreams.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  leaveRoom() {
    if (this.myStream) {
      this.myStream.getTracks().forEach((track) => track.stop());
    }
    this.remoteStreams.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    this.remoteStreams.clear();
    this.socket.disconnect();
    if (this.peer) {
      this.peer.destroy();
    }
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.leaveRoom();
  }
}
