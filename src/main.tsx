import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/components/ui/toast';
import { TraceStoreProvider } from '@/lib/store';
import App from './App';
import './index.css';
import '@/tests/run';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <TraceStoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TraceStoreProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
