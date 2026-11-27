import { Routes } from '@angular/router';
import { VideoPlayerComponent } from './player/video-player.component';

export const PLAYER_ROUTES: Routes = [
  {
    path: ':id',
    component: VideoPlayerComponent,
  },
  {
    path: '',
    component: VideoPlayerComponent,
  },
];
