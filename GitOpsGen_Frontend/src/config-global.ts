import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Plateforme Web de Génération de Configuration Kubernetes/GitOps',
  appVersion: packageJson.version,
};
