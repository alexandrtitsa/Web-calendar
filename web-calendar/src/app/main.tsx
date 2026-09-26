import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не вдалося знайти елемент #root');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);