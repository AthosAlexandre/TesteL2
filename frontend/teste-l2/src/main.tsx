import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css'; 
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, App as AntdApp } from 'antd';


createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <AntdApp>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
)
