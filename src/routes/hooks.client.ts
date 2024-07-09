import type { HandleClientError, Handle } from '@sveltejs/kit';
import type { NavigationEvent } from '$app/navigation';
import { settingsStore } from '$lib/store';
import { goto } from '$app/navigation';

export const handleError: HandleClientError = async ({ error, event }) => {
  // Handle client-side errors if needed
  console.error('Client-side error:', error);
  // You can customize the error handling logic here
  return {
    message: 'An unexpected error occurred. Please try again later.',
  };
};

export const handle: Handle = async ({ event, resolve }) => {
  if (!(settingsStore?.ollamaServer)) {
    // Redirect to /settings if the server is not connected
    await goto('/settings');
  } else {
    await goto('/sessions');
  }

  // Continue with the normal request handling
  return await resolve(event as NavigationEvent);
};
