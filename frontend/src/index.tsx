import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // این خط حیاتی است و باید اول باشد
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element to mount the app');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);