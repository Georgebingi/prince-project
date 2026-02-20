import './index.css';

import { createRoot } from "react-dom/client";
import { App } from "./App";

// Suppress Vite HMR WebSocket errors in development
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;

  // Suppress console methods for Vite-related messages
  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (message.includes('WebSocket') || message.includes('vite') || message.includes('[vite]')) {
      return; // Suppress Vite WebSocket warnings
    }
    originalWarn(...args);
  };

  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (message.includes('WebSocket') || message.includes('[vite]') || message.includes('Failed to connect')) {
      return; // Suppress Vite WebSocket errors
    }
    originalError(...args);
  };

  // Also suppress certain logs
  console.log = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (message.includes('[vite]')) {
      return;
    }
    originalLog(...args);
  };

  // Handle unhandled promise rejections related to WebSocket
  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '');
    if (reason.includes('WebSocket') || reason.includes('closed without opened')) {
      event.preventDefault(); // Prevent the error from showing
    }
  });
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
  });
}
