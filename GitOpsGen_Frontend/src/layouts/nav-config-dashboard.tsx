/* eslint-disable perfectionist/sort-imports */
import React from 'react';
import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// Wrapper pour les icônes emoji
const IconWrapper = ({ emoji }: { emoji: string }) => (
  <span style={{
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    fontSize: '1.1rem',
    filter: 'saturate(1.1)'
  }}>
    {emoji}
  </span>
);

// Interface avec propriété 'info' ajoutée
export interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[];
}

export const navData: NavItem[] = [
  {
    title: 'Tableau de bord',
    path: '/dashboard',
    icon: <SvgColor src="/assets/icons/navbar/ic-analytics.svg" sx={{ width: 24, height: 24 }} />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'Utilisateurs',
    path: '/user',
    icon: <SvgColor src="/assets/icons/navbar/ic-user.svg" sx={{ width: 24, height: 24 }} />,
    roles: ['admin'],
  },
  {
    title: 'Configuration Clients',
    path: '/configuration_groups',
    icon: <IconWrapper emoji="🗂️" />,
    roles: ['admin','ops'],
   
  },
  {
    title: 'Configuration Application',
    path: '/configuration_application',
    icon: <IconWrapper emoji="📱" />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'Helm Charts',
    path: '/helm_chart',
    icon: <IconWrapper emoji="⎈" />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'Formulaire YAML',
    path: '/FormulaireValues',
    icon: <IconWrapper emoji="📝" />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'Modification CI/CD',
    path: '/Modification CI/CD',
    icon: <IconWrapper emoji="🔄" />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'Supervision GitLab & ArgoCD',
    path: '/supervision_gitlab',
    icon: <IconWrapper emoji="🔍" />,
    roles: ['admin','ops','developpeur'],
  },
  {
    title: 'ChatBot',
    path: '/blog',
    icon: <IconWrapper emoji="🤖" />,
    roles: ['admin','ops','developpeur'],
    info: <Label color="error">Beta</Label> // Autre exemple
  },
];

export default navData;