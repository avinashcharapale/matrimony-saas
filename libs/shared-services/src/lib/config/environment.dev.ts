/**
 * Development Environment Configuration
 * Override API_CONFIG with development-specific settings
 */
import { API_CONFIG } from './api.config';

export const environment = {
  production: false,
  apiConfig: {
    ...API_CONFIG,
    baseUrl: 'http://localhost:8000', // YARP gateway
    identityUrl: 'https://localhost:44341',
    tenantUrl: 'https://localhost:44357',
    profileUrl: 'https://localhost:7109',
    subscriptionUrl: 'https://localhost:7024',
    matchUrl: 'https://localhost:44367',
    chatUrl: 'https://localhost:7058',
    notificationUrl: 'https://localhost:44341',
    analyticsUrl: '',
  },
};
