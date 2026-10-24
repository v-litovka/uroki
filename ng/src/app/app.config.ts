import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // hash-маршруты: GitHub Pages не умеет отдавать index.html на глубокие ссылки
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
  ],
};
