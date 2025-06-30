// Importe StrictMode de React pour détecter les problèmes potentiels dans l'application.
// Il active des vérifications supplémentaires pendant le développement.
import { StrictMode } from 'react';
// Importe la méthode createRoot depuis la nouvelle API de React 18
// pour attacher l'application React à un élément HTML.
import { createRoot } from 'react-dom/client';
// Importe les composants de routing depuis React Router :
// - Outlet : sert de placeholder pour afficher les routes enfants dans un composant parent.
// - RouterProvider : fournit le routeur à toute l'application React.
// - createBrowserRouter : crée un routeur basé sur l'URL du navigateur.
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import App from './app';
// Importe le composant principal de l'application, souvent utilisé comme layout global.
import { routesSection } from './routes/sections';
// Importe la configuration des routes définie ailleurs (souvent sous forme de tableau).
// Importe un composant personnalisé qui gère les erreurs de navigation (fallback UI).
import { ErrorBoundary } from './routes/components';

// ----------------------------------------------------------------------
// Création du routeur avec la fonction createBrowserRouter.
// Ce routeur contient une structure imbriquée :
// - Le composant principal <App> est un wrapper global (ex: avec une barre latérale, en-tête...).
// - <Outlet /> rendra dynamiquement les composants enfants selon la route.
// - En cas d'erreur, <ErrorBoundary /> sera affiché.
// - Les routes réelles sont définies dans routesSection (pages enfants).
const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);
// Récupère l'élément HTML avec l'id 'root' dans index.html
// et crée la racine React à cet endroit.
const root = createRoot(document.getElementById('root')!);
// Démarre l'application React en injectant le composant RouterProvider
// dans StrictMode (pour un meilleur développement).
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
