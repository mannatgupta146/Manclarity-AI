import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app/index.css'
import App from './app/App.jsx'
import { Provider } from 'react-redux'
import { store } from './app/app.store.js'

// Ensure theme color is applied on initial load
const THEME_KEY = 'manclarity_theme';
const theme = localStorage.getItem(THEME_KEY) || 'light';
if (theme === 'dark') {
  document.body.classList.add('dark');
} else {
  document.body.classList.remove('dark');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <App />
    </Provider>
  </StrictMode>,
)
