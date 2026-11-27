import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error('Falha ao inicializar Native Federation (MFE-Player):', err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
