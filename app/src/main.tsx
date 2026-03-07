import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './home'
import { Authentication } from './authentication'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/authentication" element={<Authentication />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)