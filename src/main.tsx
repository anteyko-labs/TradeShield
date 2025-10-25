import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Полифиллы для ethers.js
import { Buffer } from 'buffer';

// Делаем Buffer доступным глобально
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}
if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
