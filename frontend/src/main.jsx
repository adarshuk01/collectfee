import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import { MemberProvider } from './context/MemberContext.jsx'
import { PaymentProvider } from './context/PaymentContext.jsx'
import { BatchProvider } from './context/BatchContext.jsx'
import "./i18n";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <MemberProvider>
            <PaymentProvider>
              <BatchProvider>
                <App />
              </BatchProvider>
            </PaymentProvider>
          </MemberProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
