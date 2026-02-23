import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Bootstrap the standalone Angular app with router + HTTP.
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
