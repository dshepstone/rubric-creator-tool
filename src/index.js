import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// Get the Clerk publishable key from the environment
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Warn clearly if it's missing
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === 'your_clerk_publishable_key') {
  console.error(
    '❌ Clerk Publishable Key is missing or not set correctly.\n' +
    'Make sure you have a valid key in your .env file like this:\n' +
    'REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...\n'
  );
  throw new Error('Clerk publishable key is not defined.');
}

// Create root element and render the app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
console.log('Loaded Clerk Key:', PUBLISHABLE_KEY);

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
