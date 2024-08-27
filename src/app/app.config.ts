import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideSocketIO } from './socket-io.provider';

const devUrl = 'http://localhost:3000';
// const prodUrl = 'https://node-zoom-backend.onrender.com/';
// const danishSirUrl = 'https://node-zoom-backend-danish.onrender.com/';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideSocketIO({
      url: devUrl,
      options: {},
    }),
  ],
};
