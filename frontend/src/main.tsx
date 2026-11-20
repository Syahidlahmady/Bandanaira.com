import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)

// Register Service Worker for Offline PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[Banda PWA] Service Worker terdaftar dengan scope:', reg.scope)
      })
      .catch((err) => {
        console.warn('[Banda PWA] Pendaftaran Service Worker gagal:', err)
      })
  })
}
