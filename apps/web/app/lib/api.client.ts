/**
 * ARTISAN-237 — API Client
 * Instance Axios centralisée avec intercepteur JWT.
 * 
 * PAS d'intercepteur 401 — il causait des boucles de redirection.
 * Les erreurs 401 sont gérées au niveau des composants/hooks.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur Requête : attache le token JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;