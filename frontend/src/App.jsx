import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import OnboardingScreen from './pages/OnboardingScreen'
import { Route, Routes } from 'react-router-dom'
import Signup from './pages/Authentication/Signup'
import SignIn from './pages/Authentication/SignIn'
import ForgotPass from './pages/Authentication/ForgotPass'
import Otp from './pages/Authentication/Otp'
import AuthLayout from './pages/Authentication/AuthLayout'
import Layout from './layout/Layout'
import SettingsPage from './pages/SettingsPage'
import PersonalInfo from './components/settings/PersonalInfo'
import Notification from './components/settings/Notification'
import Security from './components/settings/Security'
import LanguageSelection from './components/settings/LanguageSelection'
import { Toaster } from 'react-hot-toast'
import HelpSupport from './components/settings/HelpSupport'
import PaymentMethod from './components/settings/PaymentMethod'
import Subscription from './pages/Subscription'
import SubscriptionForm from './components/SubscriptionForm'
import MemberForm from './components/MemberForm'
import Members from './pages/Members'
import MembersDetails from './components/member/MembersDetails'
import MemberPayments from './components/member/MemberPayments'
import QuickPay from './pages/QuickPay'
import PaymentReceipt from './components/payments/PaymentReceipt'
import MemberTransaction from './components/member/MemberTransaction'
import Dashboard from './pages/Dashboard'
import ReceiptSettings from './components/settings/ReceiptSettings'
import MonthlyReport from './components/reports/MonthlyReport'
import Groups from './pages/Groups'
import GroupForm from './components/group/GroupForm'
import GroupDetails from './components/group/GroupDetails'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path='/screens' element={<OnboardingScreen />} />
        <Route path='/auth' element={<AuthLayout />}>
          <Route path='signup' element={<Signup />} />
          <Route path='signin' element={<SignIn />} />
          <Route path='forgot-password' element={<ForgotPass />} />
          <Route path='verify-otp' element={<Otp />} />
        </Route>
        <Route path='/' element={<Layout />}>
          <Route path='' element={<Dashboard />} />
          <Route path='booking' element={<>Booking</>} />
          <Route path='members' element={<Members />} />
          <Route path='settings' element={<SettingsPage />} />
          <Route path='settings/personalinfo' element={<PersonalInfo />} />
          <Route path='settings/notification' element={<Notification />} />
          <Route path='settings/security' element={<Security />} />
          <Route path='settings/language' element={<LanguageSelection />} />
          <Route path="settings/receipt" element={<ReceiptSettings />} />


          <Route path='settings/help&support' element={<HelpSupport />} />
          <Route path='settings/paymentmethod' element={<PaymentMethod />} />
          <Route path='subscription' element={<Subscription />} />
          <Route path="subscription/add" element={<SubscriptionForm />} />
          <Route path="subscription/edit/:id" element={<SubscriptionForm />} />
          <Route path="member/add" element={<MemberForm />} />
          <Route path="/member/edit/:id" element={<MemberForm />} />
          <Route path="/member/:id" element={<MembersDetails />} />
          <Route path="/member/payments/:memberId" element={<MemberPayments />} />

          <Route path="/quickpay" element={<QuickPay />} />
          <Route path="/groups" element={<Groups/>} />
          <Route path="/groups/add" element={<GroupForm/>} />
           <Route path="/groups/:id" element={<GroupDetails/>} />
          <Route path="/reports" element={<></>} />
           <Route path="/reports/monthly" element={<MonthlyReport/>} />
          <Route path="/member/transactions/:memberId" element={<MemberTransaction/>} />



          <Route path="/receipt/:id" element={<PaymentReceipt />} />

        </Route>

      </Routes>
    </>
  )
}

export default App
