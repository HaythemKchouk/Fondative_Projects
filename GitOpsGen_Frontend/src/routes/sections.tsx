/* eslint-disable perfectionist/sort-imports */
import type { RouteObject } from 'react-router';
import type { ReactNode } from 'react'; // <-- Import ReactNode

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { ConfigurationApplicationView } from 'src/sections/configuration_application';
// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const ConfigurationApplicationPage = lazy(() => import('src/pages/configuration_application'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const HelmChartUploadPage = lazy(() => import('src/pages/helm_chart'));
export const ConfigurationGroupsPage = lazy(() => import('src/pages/configuration_groups'));
export const FormulaireValuesPage = lazy(() => import('src/pages/formulaire_values'));
export const ModificationcicdPage = lazy(() => import('src/pages/modification_cicd'));
export const PipelineSupervisorPage = lazy(() => import('src/pages/supervision_gitlab'));
export const ParametrePage = lazy(() => import('src/pages/parmetre'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Fonction pour vérifier si l'utilisateur est connecté
const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

// Composant wrapper de protection
const ProtectedRoute = ({ children }: { children: ReactNode }) =>
  isAuthenticated() ? children : <Navigate to="/sign-in" replace />;


export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'configuration_application', element: <ConfigurationApplicationPage /> },
      { path: 'helm_chart', element: <HelmChartUploadPage /> },
      { path: 'configuration_groups', element: <ConfigurationGroupsPage /> },
      { path: 'FormulaireValues', element: <FormulaireValuesPage /> },
      { path: 'Modification CI/CD', element: <ModificationcicdPage /> },
      { path: 'supervision_gitlab', element: <PipelineSupervisorPage /> },
      { path: 'parametre', element: <ParametrePage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  {
    path: '*',
    element: <Page404 />,
  },
];
