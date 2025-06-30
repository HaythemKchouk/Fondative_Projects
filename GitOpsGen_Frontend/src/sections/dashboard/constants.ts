// Jeton d'accès personnel pour l'API GitLab, utilisé pour authentifier les requêtes.
// ATTENTION : en production, il est recommandé de stocker ce type de token dans des variables d'environnement pour des raisons de sécurité.
export const token = 'glpat-SDBni-qYtBM1xP_6czHo';

// Jeton d'accès Bearer pour accéder à l'API ArgoCD, utilisé dans les en-têtes d'autorisation des requêtes.
export const argoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.spIndGSeNEmURn9vn6Pvxn-l2ZsJy-YPSWhoyKoyRcs';

// Constante définissant le nombre maximum de pipelines récupérés par requête API.
// Permet de limiter la quantité de données traitées pour éviter les surcharges ou ralentissements.
export const PIPELINE_FETCH_LIMIT = 50;

// Taille des lots (batch) utilisés lors du traitement par lots des requêtes ou opérations asynchrones.
// Permet de gérer la charge en découpant les traitements en groupes plus petits.
export const BATCH_SIZE = 20;
