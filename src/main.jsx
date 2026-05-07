import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@radix-ui/themes/styles.css'
import './index.css'
import { Theme } from '@radix-ui/themes'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Theme appearance="dark" accentColor="cyan" grayColor="slate" radius="large">
      <App />
    </Theme>
  </StrictMode>,
)
