import React from 'react';
import ReactDOM from 'react-dom/client';
import i18n from './utils/locales';

// 导入翻译资源 - 这将确保翻译文件被打包
import './locales/zh-CN.json';
import './locales/en-US.json';

import App from './App';
import './index.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
