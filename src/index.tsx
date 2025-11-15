import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './utils/locales';

import App from './App';
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
