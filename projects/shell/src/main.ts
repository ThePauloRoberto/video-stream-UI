import { initFederation } from '@angular-architects/native-federation';

initFederation('/assets/federation.manifest.json')
  .catch((err) => console.error('Falha ao carregar o manifesto do Native Federation:', err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error('Falha ao inicializar o Shell:', err));
