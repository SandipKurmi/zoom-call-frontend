import { InjectionToken, Provider } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';

export const SOCKET_CONFIG = new InjectionToken<SocketIoConfig>(
  'SOCKET_CONFIG'
);

export function socketIOFactory(config: SocketIoConfig) {
  return new Socket(config);
}

export function provideSocketIO(config: SocketIoConfig): Provider[] {
  return [
    {
      provide: SOCKET_CONFIG,
      useValue: config,
    },
    {
      provide: Socket,
      useFactory: socketIOFactory,
      deps: [SOCKET_CONFIG],
    },
  ];
}
