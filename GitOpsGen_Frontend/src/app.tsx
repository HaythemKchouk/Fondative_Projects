// Importe les styles globaux (CSS commun à toute l'application)
import 'src/global.css';

// Importe le hook React pour gérer les effets secondaires
import { useEffect } from 'react';

// Importe le bouton flottant (Floating Action Button) de MUI
import Fab from '@mui/material/Fab';

// Importe un hook personnalisé pour obtenir le chemin actuel de l'URL
import { usePathname, useRouter } from 'src/routes/hooks'; // Ajoute useRouter

// Importe le fournisseur de thème (permet d'appliquer un thème MUI globalement)
import { ThemeProvider } from 'src/theme/theme-provider';

// Importe un composant d’icône personnalisée (utilisé ici pour afficher l’icône GitLab)
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Déclare les props attendues pour le composant App : ici un seul prop "children"
type AppProps = {
  children: React.ReactNode;
};

// Composant principal App
export default function App({ children }: AppProps) {
  // Appelle le hook personnalisé pour faire défiler en haut et rediriger si besoin
  useScrollToTopAndRedirect();

  // Fonction qui retourne un bouton flottant pointant vers le dépôt GitLab du projet
  const gitlabButton = () => (
    <Fab
      size="medium"
      aria-label="GitLab"
      href="https://gitlab.com/dashboard/groups"
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 48,
        height: 48,
        position: 'fixed',
        bgcolor: 'grey.800',
      }}
    >
      {/* Affiche l’icône GitLab avec une couleur blanche */}
      <Iconify width={24} icon={"logos:gitlab" as any} sx={{ '--color': 'white' }} />
    </Fab>
  );

  // Retourne le JSX : applique le thème global, affiche les enfants de l'app, et le bouton GitLab
  return (
    <ThemeProvider>
      {children}
      {gitlabButton()}
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------
// Hook personnalisé pour remonter automatiquement en haut de page à chaque changement de route
// et rediriger vers /sign-in si on est sur /
function useScrollToTopAndRedirect() {
  const pathname = usePathname(); // Récupère le chemin actuel
  const router = useRouter();     // Pour rediriger

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll en haut

    // Redirige vers /sign-in si on est à la racine
    if (pathname === '/') {
      router.push('/sign-in');
    }
  }, [pathname, router]);

  return null;
}
