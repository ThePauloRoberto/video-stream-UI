import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalog',
  },
  {
    path: 'catalog',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'mfe-catalog',
        exposedModule: './Routes',
      }).then((m) => m.CATALOG_ROUTES),
  },
  {
    path: 'player/:id',
    loadComponent: () =>
      loadRemoteModule({
        remoteName: 'mfe-player',
        exposedModule: './Component',
      }).then((m) => m.VideoPlayerComponent),
  },
  {
    path: 'player',
    loadChildren: () =>
      loadRemoteModule({
        remoteName: 'mfe-player',
        exposedModule: './Routes',
      }).then((m) => m.PLAYER_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'catalog',
  },
];
