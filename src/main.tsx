import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: #0a0a0a; color: #fff; font-family: system-ui, -apple-system, sans-serif;">
      <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #a0a0a0; margin-bottom: 8px;">Failed to start the application.</p>
      <pre style="background: #1a1a1a; padding: 16px; border-radius: 8px; overflow: auto; max-width: 600px; color: #ef4444; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 16px; padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Reload Page</button>
    </div>
  `;
}
