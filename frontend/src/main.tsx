import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeI18n } from './i18n/config'

// Initialize i18n before rendering
initializeI18n().then(() => {
  // 開発環境では強制的に日本語を設定
  if (import.meta.env.DEV && localStorage.getItem('i18nextLng') !== 'ja') {
    localStorage.setItem('i18nextLng', 'ja');
  }
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
