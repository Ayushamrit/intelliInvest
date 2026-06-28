/**
 * Centralized API configuration.
 *
 * In development: falls back to http://localhost:3001
 * In production:  reads VITE_API_URL set in Vercel environment variables
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
