// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

const config = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};

bootstrapApplication(AppComponent, config)
  .catch(err => console.error(err));
