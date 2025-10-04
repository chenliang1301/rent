import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 创建根节点并渲染应用
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
