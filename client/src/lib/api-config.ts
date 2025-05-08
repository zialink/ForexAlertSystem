// This file determines the API base URL based on the environment

// Function to get the API base URL
export function getApiBaseUrl(): string {
  // For development environment
  if (import.meta.env.DEV) {
    return ''; // Empty string means relative to current host
  }
  
  // For production environment with Firebase Functions
  return import.meta.env.VITE_API_URL || 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api';
}

// Export the base URL
export const API_BASE_URL = getApiBaseUrl();