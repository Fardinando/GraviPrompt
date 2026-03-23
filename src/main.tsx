import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress Vite WebSocket errors that can cause overlays in some environments
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message?.includes('WebSocket closed without opened') ||
    event.reason.message?.includes('[vite] failed to connect to websocket')
  )) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('WebSocket closed without opened') ||
    event.message.includes('[vite] failed to connect to websocket')
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}
